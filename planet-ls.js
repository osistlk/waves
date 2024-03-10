const { createCanvas } = require('canvas');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

const width = 1280; // 720p resolution
const height = 720;
const numFrames = 600; // 60 fps * 10 seconds
const tempDir = path.join(__dirname, 'temp_frames');

// Ensure the temporary directory for frames exists
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

// Placeholder for recycling bin "fullness"
const recyclingBinFullness = 0.5; // This is a fixed value for demonstration

function drawSun(context, fullness) {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 50; // Adjusted for video resolution

    const brightness = 50 + 205 * fullness;
    const color = `rgb(${brightness}, ${brightness}, 0)`;

    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    context.fillStyle = color;
    context.fill();
}

function drawPlanets(context) {
    const items = fs.readdirSync(process.cwd());
    let angle = 0;
    const angleStep = (2 * Math.PI) / items.length;

    items.forEach(item => {
        const isDirectory = fs.statSync(path.join(process.cwd(), item)).isDirectory();
        const distance = 150; // Adjusted for clearer visualization
        const planetSize = isDirectory ? 20 : 10;
        const planetColor = isDirectory ? 'rgba(0, 0, 255, 0.5)' : 'rgba(139, 69, 19, 1)';

        const posX = (width / 2) + distance * Math.cos(angle);
        const posY = (height / 2) + distance * Math.sin(angle);
        angle += angleStep;

        context.beginPath();
        context.arc(posX, posY, planetSize, 0, 2 * Math.PI);
        context.fillStyle = planetColor;
        context.fill();
    });
}

// Generate frames
for (let i = 0; i < numFrames; i++) {
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');

    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);

    drawSun(context, recyclingBinFullness);
    drawPlanets(context);

    const framePath = path.join(tempDir, `frame-${i.toString().padStart(4, '0')}.png`);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(framePath, buffer);
}

// Use ffmpeg to compile frames into a video
const ffmpegCmd = `ffmpeg -framerate 60 -i ${tempDir}/frame-%04d.png -c:v libx264 -pix_fmt yuv420p -vf "scale=1280:720" filesystem_visualization.mp4`;

exec(ffmpegCmd, (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }
    console.log('Video created: filesystem_visualization.mp4');
    // Optional: Cleanup temp frames after creating the video
});
