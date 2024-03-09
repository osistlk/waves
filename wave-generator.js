const fs = require('fs');
const { createCanvas } = require('canvas');
const path = require('path');
const GIFEncoder = require('gifencoder');
const ProgressBar = require('progress');

const width = 400;
const height = 400;
const waveAmplitude = 100;
const waveFrequency = 0.01;
const dirPath = path.join(__dirname, 'temp');

// Ensure the directory exists
fs.mkdirSync(dirPath, { recursive: true });

const encoder = new GIFEncoder(width, height);
const outputPath = path.join(dirPath, 'wave.gif');
encoder.createReadStream().pipe(fs.createWriteStream(outputPath));
encoder.start();
encoder.setDelay(17);  // frame delay in ms
encoder.setRepeat(0);   // 0 for repeat, -1 for no-repeat
encoder.setQuality(10); // image quality. 10 is for high quality

// Create a new progress bar
const bar = new ProgressBar(':bar :percent', { total: 60 });

// Generate 60 frames
for (let frame = 0; frame < 60; frame++) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Set the background color
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);

    // Set the foreground color
    ctx.strokeStyle = 'white';

    // Variables for the wave
    let time = frame / 60; // Change over time

    // Draw the wave
    ctx.beginPath();
    for (let x = 0; x < width; x++) {
        let y = waveAmplitude * Math.sin((x * waveFrequency) + time) + (height / 2);
        ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Add the frame to the GIF
    encoder.addFrame(ctx);

    // Update the progress bar
    bar.tick();
}

encoder.finish();
