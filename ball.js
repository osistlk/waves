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

function drawBall(context, x, y) {
    let hitBoundary = false;
    context.beginPath();
    context.arc(x, y, ballRadius, 0, 2 * Math.PI, false);
    context.fillStyle = 'green';
    context.fill();
    context.lineWidth = 5;
    context.strokeStyle = '#003300';
    context.stroke();

    // Check if the ball hits the boundary
    if (x - ballRadius < 0 || x + ballRadius > width || y - ballRadius < 0 || y + ballRadius > height) {
        hitBoundary = true;
    }
    return hitBoundary;
}

async function createCollisionSound(collisions, duration, sampleRate) {
    let totalSamples = duration * sampleRate * totalImages; // Total samples for the entire video
    let samples = new Float32Array(totalSamples);
    let beepDuration = sampleRate; // 1 second beep for simplicity
    let beepFrequency = 440; // Frequency of beep
    let step = (beepFrequency * 2 * Math.PI) / sampleRate;

    collisions.forEach(frame => {
        let startSample = frame * duration * sampleRate;
        for (let i = 0; i < beepDuration; i++) {
            if (startSample + i < totalSamples) {
                samples[startSample + i] = Math.sin(i * step) * 0.5; // 0.5 as volume
            }
        }
    });

    const wav = new WaveFile();
    wav.fromScratch(1, sampleRate, '32f', samples);
    fs.writeFileSync('collisionSound.wav', wav.toBuffer());
}

async function createImages() {
    let tempDir = path.join(process.cwd(), 'temp');
    let collisions = [];

    if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true });
    }

    fs.mkdirSync(tempDir, { recursive: true });
    console.log(`\nImages will be written to ${tempDir}`);

    const bar = new ProgressBar(':bar :percent :etas :elapseds', { total: totalImages, width: 40 });

    for (let i = 0; i < totalImages; i++) {
        const canvas = createCanvas(width, height);
        const context = canvas.getContext('2d');
        const x = i % width;
        const y = Math.abs(height * Math.sin(i / 100));
        if (drawBall(context, x, y)) {
            collisions.push(i);
        }

        const buffer = canvas.toBuffer('image/jpeg', { quality: 1 });
        await fs.promises.writeFile(path.join(tempDir, `image${i}.jpeg`), buffer);
        bar.tick();
    }

    // Generate collision sound for the video
    await createCollisionSound(collisions, 1 / 60, 44100); // Assuming 60 FPS video

    console.log(`\nCollision sound generated as 'collisionSound.wav'`);

    // Update the ffmpeg command to use the new collision sound file
    exec(`ffmpeg -framerate 60 -i ${tempDir}/image%01d.jpeg -i collisionSound.wav -c:v mpeg4 -c:a aac -strict experimental -r 60 ${tempDir}output.mp4`, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
    });
}

createImages().catch(console.error);
