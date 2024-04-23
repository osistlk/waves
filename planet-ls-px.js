const { fork } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');
const { exec } = require('child_process');

const numFrames = 600; // Total number of frames
const numCPUs = os.cpus().length; // Number of CPUs to determine how many child processes to spawn
const tempDir = path.join(__dirname, 'temp_frames');

// Ensure the temporary directory for frames exists
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

let completedProcesses = 0;
const framesPerProcess = Math.ceil(numFrames / numCPUs);

function createVideo() {
    const ffmpegCmd = `ffmpeg -y -vsync 0 -hwaccel cuda -hwaccel_output_format cuda -framerate 60 -i ${tempDir}/frame-%04d.png -an -c:v h264_nvenc filesystem_visualization.mp4`;

    exec(ffmpegCmd, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        console.log('Video created: filesystem_visualization.mp4');
        // Optional: Cleanup temp frames after creating the video
        return;
    });
}

for (let i = 0; i < numCPUs; i++) {
    const startFrame = i * framesPerProcess;
    const endFrame = Math.min((i + 1) * framesPerProcess, numFrames) - 1; // Adjust endFrame for each process
    const child = fork('frameGenerator.js');

    child.send({ startFrame, endFrame, tempDir }); // Sending data to child process

    child.on('message', (message) => {
        console.log(`Child ${message.pid}: ${message.status}`);
        if (++completedProcesses === numCPUs) {
            console.log('All frames generated, proceeding to create video...');
            createVideo();
        }
    });
}
