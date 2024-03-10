const fs = require('fs');
const { createCanvas } = require('canvas');
const path = require('path');
const ProgressBar = require('progress');
const { exec } = require('child_process');
const { WaveFile } = require('wavefile');

const width = 2560;
const height = 1440;
const ballRadius = 100;
const totalImages = 600 * 6; // Total frames for the video

// Modified to accept a color parameter
function drawBall(context, x, y, color) {
    let hitBoundary = false;
    context.beginPath();
    context.arc(x, y, ballRadius, 0, 2 * Math.PI, false);
    context.fillStyle = color;
    context.fill();
    context.lineWidth = 5;
    context.strokeStyle = '#003300';
    context.stroke();

    if (x - ballRadius < 0 || x + ballRadius > width || y - ballRadius < 0 || y + ballRadius > height) {
        hitBoundary = true;
    }
    return hitBoundary;
}

// Adjusted for milder beep sound
async function createCollisionSound(collisions, duration, sampleRate, volume = 0.1) {
    let totalSamples = duration * sampleRate * totalImages;
    let samples = new Float32Array(totalSamples);
    let beepDuration = sampleRate; // 1 second beep for simplicity
    let beepFrequency = 440;
    let step = (beepFrequency * 2 * Math.PI) / sampleRate;

    collisions.forEach(frame => {
        let startSample = frame * duration * sampleRate;
        for (let i = 0; i < beepDuration && startSample + i < totalSamples; i++) {
            samples[startSample + i] += Math.sin(i * step) * volume;
        }
    });

    const wav = new WaveFile();
    wav.fromScratch(1, sampleRate, '32f', samples);
    fs.writeFileSync('collisionSound.wav', wav.toBuffer());
}

async function createImages() {
    let tempDir = path.join(process.cwd(), 'temp');
    let collisions = [];
    let color = 'green'; // Initial color

    if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true });
    }

    fs.mkdirSync(tempDir, { recursive: true });
    console.log(`\nImages will be written to ${tempDir}`);

    const bar = new ProgressBar(':bar :percent :etas :elapseds', { total: (totalImages * 2) + 3, width: 40 });

    const imageWritePromises = [];

    for (let i = 0; i < totalImages; i++) {
        const canvas = createCanvas(width, height);
        const context = canvas.getContext('2d');
        const x = i % width;
        const y = Math.abs(height * Math.sin(i / 100));

        // Change color upon collision
        if (drawBall(context, x, y, color)) {
            collisions.push(i);
            color = color === 'green' ? 'red' : 'green';
        }

        const buffer = canvas.toBuffer('image/jpeg', { quality: 1 });
        imageWritePromises.push(fs.promises.writeFile(path.join(tempDir, `image${i}.jpeg`), buffer).then(() => bar.tick()));
        bar.tick(); // Update the progress bar when each promise is pushed
    }

    // Wait for all the writeFile operations to complete
    await Promise.all(imageWritePromises);
    console.log('\nAll images have been written.');
    bar.tick();

    await createCollisionSound(collisions, 1 / 60, 44100, 0.1); // Assuming 60 FPS, milder beep

    console.log(`\nCollision sound generated as 'collisionSound.wav'`);
    bar.tick();

    // Update the ffmpeg command to use the new collision sound file
    exec(`ffmpeg -framerate 60 -i ${tempDir}/image%01d.jpeg -i collisionSound.wav -c:v libx264 -pix_fmt yuv420p -c:a aac -strict experimental -r 60 ${tempDir}\\output.mp4`, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
        bar.tick();
    });
}

createImages().catch(console.error);
