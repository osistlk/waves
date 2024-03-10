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

function drawPlanet(context, centerX, centerY, radius, angle, size, color) {
    const posX = centerX + radius * Math.cos(angle);
    const posY = centerY + radius * Math.sin(angle);

    context.beginPath();
    context.arc(posX, posY, size, 0, 2 * Math.PI);
    context.fillStyle = color;
    context.fill();
}

// Function to get the size of a file or total size of files in a directory
function getSize(itemPath) {
    const stats = fs.statSync(itemPath);
    if (stats.isDirectory()) {
        const files = fs.readdirSync(itemPath);
        return files.reduce((total, file) => {
            return total + getSize(path.join(itemPath, file));
        }, 0);
    } else {
        return stats.size;
    }
}

// Initialize the progress bar
const bar = new ProgressBar('Generating frames [:bar] :percent :etas :elapseds', {
    complete: '=',
    incomplete: ' ',
    width: 40,
    total: numFrames
});

const items = fs.readdirSync(process.cwd());
const maxSize = Math.max(...items.map(item => getSize(path.join(process.cwd(), item))));

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
        const itemPath = path.join(process.cwd(), item);
        const size = getSize(itemPath);
        const orbitRadius = 150 + index * 30; // Distance from the sun
        const planetSize = 5 + (size / maxSize) * 20; // Scale size relative to the largest item
        const planetColor = fs.statSync(itemPath).isDirectory() ? 'rgba(0, 0, 255, 0.5)' : 'rgba(139, 69, 19, 1)';
        const orbitSpeed = 2 * Math.PI / numFrames; // Complete one orbit per video
        const angle = orbitSpeed * frame + (2 * Math.PI / items.length) * index; // Current angle

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
