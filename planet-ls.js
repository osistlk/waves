const { createCanvas } = require('canvas');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const ProgressBar = require('progress');

const width = 1280; // 720p resolution
const height = 720;
const numFrames = 600; // 60 fps * 10 seconds
const tempDir = path.join(__dirname, 'temp_frames');

// Ensure the temporary directory for frames exists
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

const recyclingBinFullness = 0.5; // Placeholder for recycling bin "fullness"

function drawSun(context) {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 50;

    const brightness = 50 + 205 * recyclingBinFullness;
    const color = `rgb(${brightness}, ${brightness}, 0)`;

    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    context.fillStyle = color;
    context.fill();
}

function drawPlanet(context, centerX, centerY, radius, angle, planetSize, color) {
    const posX = centerX + radius * Math.cos(angle);
    const posY = centerY + radius * Math.sin(angle);

    context.beginPath();
    context.arc(posX, posY, planetSize, 0, 2 * Math.PI);
    context.fillStyle = color;
    context.fill();
}

// Initialize the progress bar
const bar = new ProgressBar('Generating frames [:bar] :percent :etas :elapseds', {
    complete: '=',
    incomplete: ' ',
    width: 40,
    total: numFrames
});

const items = fs.readdirSync(process.cwd());
const angleStep = (2 * Math.PI) / items.length; // Distribute planets evenly along the orbit

// Generate frames with progress bar update
for (let frame = 0; frame < numFrames; frame++) {
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');

    // Background
    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);

    // Draw the sun
    drawSun(context);

    // Draw planets in orbit
    items.forEach((item, index) => {
        const isDirectory = fs.statSync(path.join(process.cwd(), item)).isDirectory();
        const orbitRadius = 150 + index * 30; // Increase orbit radius for each planet
        const planetSize = isDirectory ? 20 : 10;
        const planetColor = isDirectory ? 'rgba(0, 0, 255, 0.5)' : 'rgba(139, 69, 19, 1)';
        const orbitSpeed = 2 * Math.PI / numFrames; // Complete one orbit per video
        const angle = orbitSpeed * frame + angleStep * index; // Current angle based on frame

        drawPlanet(context, width / 2, height / 2, orbitRadius, angle, planetSize, planetColor);
    });

    const framePath = path.join(tempDir, `frame-${frame.toString().padStart(4, '0')}.png`);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(framePath, buffer);

    bar.tick();
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
