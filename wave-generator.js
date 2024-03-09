// Record the start time
const startTime = process.hrtime();

// Record the starting memory usage
const startingMemoryUsage = process.memoryUsage().heapUsed;

let peakMemoryUsage = startingMemoryUsage;

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');
const ProgressBar = require('progress');
const child_process = require('child_process');

const width = 2560;
const height = 1440;
const waveAmplitude = 500;
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

    // Set the line color
    ctx.strokeStyle = 'white';

    // Modify the wave amplitude and frequency a small bit for each frame
    let modifiedWaveAmplitude = waveAmplitude + (frame * 0.1);
    let modifiedWaveFrequency = waveFrequency + (frame * 0.001);

    // Calculate the amplitude for this frame
    let amplitude = modifiedWaveAmplitude * (1 + Math.sin(2 * Math.PI * frame / (fps * 2)));

    // Variables for the wave
    let time = frame / frames; // Change over time

    // Draw the wave
    ctx.beginPath();
    for (let x = 0; x < width; x++) {
        let y = amplitude * Math.sin((x * modifiedWaveFrequency) + time) + (height / 2);
        ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Save the frame as a JPEG file
    const filePath = path.join(dirPath, `wave-${frame}.jpg`);

    const currentMemoryUsage = process.memoryUsage().heapUsed;
    peakMemoryUsage = Math.max(peakMemoryUsage, currentMemoryUsage);

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
        const out = fs.createWriteStream(filePath);
        const stream = canvas.createJPEGStream({ quality: 1 }); // High quality

        // Wrap the stream.pipe() operation in a promise
        await new Promise((resolve, reject) => {
            stream.pipe(out);
            out.on('finish', resolve);
            out.on('error', reject);

            // Update the progress bar
            bar.tick();
        });
    } else {
        console.log(`File ${filePath} already exists.`);
    }
});

// Wait for all frames to be created
Promise.all(framePromises).then(() => {
    // Use FFmpeg to create the video
    const videoPath = path.join(dirPath, 'video.mp4');
    child_process.execSync(`ffmpeg -framerate ${fps} -i ${dirPath}/wave-%d.jpg -c:v libx264 -pix_fmt yuv420p ${videoPath}`);

    // Calculate and log the time taken
    const endTime = process.hrtime(startTime);
    const timeTaken = endTime[0] + endTime[1] / 1e9;
    console.log(`Time taken: ${timeTaken.toFixed(2)} seconds`);

    // Log the starting, peak, and ending memory usage
    const endingMemoryUsage = process.memoryUsage().heapUsed;
    console.log(`Starting memory usage: ${(startingMemoryUsage / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Peak memory usage: ${(peakMemoryUsage / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Ending memory usage: ${(endingMemoryUsage / 1024 / 1024).toFixed(2)} MB`);
});
