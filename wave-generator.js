const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');
const ProgressBar = require('progress');

const width = 800;
const height = 600;
const waveAmplitude = 100;
const waveFrequency = 0.02;
const fps = 60;
const length = 10; // Length of the video in seconds

const dirPath = path.join(__dirname, 'temp');
if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
}
const frames = length * fps;

// Create a new progress bar
const bar = new ProgressBar(':bar :percent ETA: :etas Elapsed: :elapseds', { total: frames, width: 20 });

// Generate frames
const framePromises = Array.from({ length: frames }, async (_, frame) => {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Set the background color
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);

    // Set the foreground color
    ctx.strokeStyle = 'white';

    // Calculate the amplitude for this frame
    let amplitude = waveAmplitude * (1 + Math.sin(2 * Math.PI * frame / (fps * 2)));

    // Variables for the wave
    let time = frame / frames; // Change over time

    // Draw the wave
    ctx.beginPath();
    for (let x = 0; x < width; x++) {
        let y = amplitude * Math.sin((x * waveFrequency) + time) + (height / 2);
        ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Save the frame as a JPEG file
    const filePath = path.join(dirPath, `wave-${frame}.jpg`);

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
        const out = fs.createWriteStream(filePath);
        const stream = canvas.createJPEGStream({ quality: 1 }); // High quality

        // Wrap the stream.pipe() operation in a promise
        await new Promise((resolve, reject) => {
            stream.pipe(out);
            out.on('finish', resolve);
            out.on('error', reject);
        });
    } else {
        console.log(`File ${filePath} already exists.`);
    }

    // Update the progress bar
    bar.tick();
});

// Wait for all frames to be created
Promise.all(framePromises).then(() => {
    // Use FFmpeg to create the video
    const videoPath = path.join(dirPath, 'video.mp4');
    child_process.execSync(`ffmpeg -framerate ${fps} -i ${dirPath}/wave-%d.jpg -c:v libx264 -pix_fmt yuv420p ${videoPath}`);
});
