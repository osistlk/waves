const fs = require('fs');
const { createCanvas } = require('canvas');
const path = require('path');
const ProgressBar = require('progress');
const child_process = require('child_process');

const width = 2560; // 1440p width
const height = 1440; // 1440p height
const waveFrequency = 0.01;
const dirPath = path.join(__dirname, 'temp');
const framesDirPath = path.join(dirPath, 'frames');

// Ensure the frames directory exists
fs.mkdirSync(framesDirPath, { recursive: true });

const length = 10 // time in seconds
const fps = 60;
const frames = length * fps;
// Create a new progress bar
const bar = new ProgressBar(':bar :percent ETA: :etas Elapsed: :elapseds', { total: frames, width: 20 });

// Generate frames
for (let frame = 0; frame < frames; frame++) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Set the background color
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);

    // Set the foreground color
    ctx.strokeStyle = 'white';

    // Calculate the amplitude for this frame
    let waveAmplitude = 50 * (1 + Math.sin(2 * Math.PI * frame / 120));

    // Variables for the wave
    let time = frame / frames; // Change over time

    // Draw the wave
    ctx.beginPath();
    for (let x = 0; x < width; x++) {
        let y = waveAmplitude * Math.sin((x * waveFrequency) + time) + (height / 2);
        ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Add text overlay
    ctx.font = '50px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText('Your Text Here', 50, 100); // Adjust coordinates as needed

    // Save the frame as a JPEG file
    const framePath = path.join(framesDirPath, `frame${frame.toString().padStart(3, '0')}.jpeg`);
    const out = fs.createWriteStream(framePath);
    const stream = canvas.createJPEGStream({ quality: 1 }); // High quality
    stream.pipe(out);

    // Update the progress bar
    bar.tick();
}

// Convert the frames to a video using FFmpeg
const videoPath = path.join(dirPath, 'wave.mp4');
child_process.execSync(`ffmpeg -framerate ${fps} -i ${framesDirPath}/frame%03d.jpeg -c:v libx264 -pix_fmt yuv420p -crf 0 ${videoPath}`);
