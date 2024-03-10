const fs = require('fs');
const { createCanvas } = require('canvas');
const path = require('path');
const ProgressBar = require('progress');
const { exec } = require('child_process');

const width = 1280;
const height = 720;
const ballRadius = 50;
const totalImages = 600 * 6;

function drawBall(context, x, y) {
    context.beginPath();
    context.arc(x, y, ballRadius, 0, 2 * Math.PI, false);
    context.fillStyle = 'green';
    context.fill();
    context.lineWidth = 5;
    context.strokeStyle = '#003300';
    context.stroke();
}

async function createImages() {
    // Create a temp directory to store the images in the current working directory
    let tempDir = path.join(process.cwd(), 'temp');

    // Remove the temp directory if it exists
    if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true });
    }

    fs.mkdirSync(tempDir, { recursive: true });
    console.log();
    console.log(`Images will be written to ${tempDir}`);

    const bar = new ProgressBar(':bar :percent :etas :elapseds', { total: totalImages + 1, width: 40 });

    const promises = [];

    for (let i = 0; i < totalImages; i++) {
        const canvas = createCanvas(width, height);
        const context = canvas.getContext('2d');

        // Calculate ball position
        const x = i % width;
        const y = Math.abs(height * Math.sin(i / 100));

        drawBall(context, x, y);

        const buffer = canvas.toBuffer('image/jpeg', { quality: 1 });
        const promise = fs.promises.writeFile(path.join(tempDir, `image${i}.jpeg`), buffer);
        promises.push(promise);
        bar.tick();
    }

    await Promise.all(promises);

    tempDir = path.join(tempDir, 'output');
    // Remove the output directory if it exists
    if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true });
    }

    fs.mkdirSync(tempDir, { recursive: true });
    console.log(`Images will be written to ${tempDir}`);
    // Create the MPEG file
    exec('ffmpeg -framerate 60 -i temp/image%01d.jpeg -c:v mpeg4 -r 60 temp/output/output.mp4', (error, stdout, stderr) => {
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
