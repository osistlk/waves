const fs = require('fs');
const { createCanvas } = require('canvas');
const path = require('path');
const ProgressBar = require('progress');

const width = 800;
const height = 600;
const ballRadius = 50;
const totalImages = 600;

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
    const tempDir = path.join(process.cwd(), 'temp');
    fs.mkdirSync(tempDir, { recursive: true });
    console.log(`Images will be written to ${tempDir}`);

    const bar = new ProgressBar(':bar :percent', { total: totalImages });

    for (let i = 0; i < totalImages; i++) {
        const canvas = createCanvas(width, height);
        const context = canvas.getContext('2d');

        // Calculate ball position
        const x = i % width;
        const y = Math.abs(height * Math.sin(i / 100));

        drawBall(context, x, y);

        const buffer = canvas.toBuffer('image/jpeg');
        await fs.promises.writeFile(path.join(tempDir, `image${i}.jpeg`), buffer);

        bar.tick();
    }
}

createImages().catch(console.error);
