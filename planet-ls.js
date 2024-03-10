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
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    context.fillStyle = `rgb(${brightness}, ${brightness}, 0)`;
    context.fill();
}

function drawPlanet(context, orbitRadius, angle, planetSize, planetColor) {
    const centerX = width / 2 + orbitRadius * Math.cos(angle);
    const centerY = height / 2 + orbitRadius * Math.sin(angle);
    context.beginPath();
    context.arc(centerX, centerY, planetSize, 0, 2 * Math.PI);
    context.fillStyle = planetColor;
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

// Pre-calculate orbit speeds and planet colors/sizes
const items = fs.readdirSync(process.cwd());
const orbitSpeed = 2 * Math.PI / numFrames; // One orbit per video
const planetDetails = items.map((item, index) => {
    const itemPath = path.join(process.cwd(), item);
    const stats = fs.statSync(itemPath);
    // Use getSize for directories to recursively calculate their size
    const size = stats.isDirectory() ? getSize(itemPath) : stats.size;
    const orbitRadius = 150 + index * 30; // Distance from the sun
    // Adjust planetSize calculation using size obtained above
    const planetSize = 5 + (size / maxSize) * 20; // Scale size relative to the largest item
    const planetColor = stats.isDirectory() ? 'rgba(0, 0, 255, 0.5)' : 'rgba(139, 69, 19, 1)';
    return { orbitRadius, planetSize, planetColor };
});


const bar = new ProgressBar('Generating frames [:bar] :percent :etas :elapseds', {
    complete: '=',
    incomplete: ' ',
    width: 40,
    total: numFrames
});

// Generate frames
for (let frame = 0; frame < numFrames; frame++) {
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');
    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);
    drawSun(context);

    planetDetails.forEach(({ orbitRadius, planetSize, planetColor }, index) => {
        const angle = orbitSpeed * frame + (2 * Math.PI / items.length) * index;
        drawPlanet(context, orbitRadius, angle, planetSize, planetColor);
    });

    fs.writeFileSync(path.join(tempDir, `frame-${frame.toString().padStart(4, '0')}.png`), canvas.toBuffer('image/png'));
    bar.tick();
}

// Compile frames into a video
exec(`ffmpeg -framerate 60 -i ${tempDir}/frame-%04d.png -c:v libx264 -pix_fmt yuv420p -vf "scale=1280:720" filesystem_visualization.mp4`, (error) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }
    console.log('Video created: filesystem_visualization.mp4');
    // Optional: Cleanup temp frames after creating the video
});
