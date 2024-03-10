const { createCanvas } = require('canvas');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const ProgressBar = require('progress');

const width = 1280; // 720p resolution
const height = 720;
const numFrames = 600; // 60 fps * 10 seconds
const tempDir = path.join(__dirname, 'temp_frames');
const outputDir = path.join(__dirname, 'output'); // Define output directory

// Ensure the temporary and output directories exist
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const recyclingBinFullness = 0.5; // Placeholder for recycling bin "fullness"

function drawSun(context) {
    context.beginPath();
    context.arc(width / 2, height / 2, 50, 0, 2 * Math.PI);
    context.fillStyle = 'yellow';
    context.fill();
}

function drawPlanet(context, orbitRadius, angle, planetSize, planetColor) {
    const posX = width / 2 + orbitRadius * Math.cos(angle);
    const posY = height / 2 + orbitRadius * Math.sin(angle);
    context.beginPath();
    context.arc(posX, posY, planetSize, 0, 2 * Math.PI);
    context.fillStyle = planetColor;
    context.fill();
}

function getSize(itemPath) {
    const stats = fs.statSync(itemPath);
    if (stats.isDirectory()) {
        return fs.readdirSync(itemPath).reduce((total, file) => total + getSize(path.join(itemPath, file)), 0);
    } else {
        return stats.size;
    }
}

const items = fs.readdirSync(process.cwd());
const maxSize = Math.max(...items.map(item => getSize(path.join(process.cwd(), item))));
const orbitPadding = 100;
const maxOrbitSize = Math.min(width, height) / 2 - orbitPadding;
const orbitStep = maxOrbitSize / items.length;

const planetDetails = items.map((item, index) => {
    const itemPath = path.join(process.cwd(), item);
    const size = getSize(itemPath);
    const planetSize = 5 + (size / maxSize) * 20;
    const planetColor = fs.statSync(itemPath).isDirectory() ? 'rgba(0, 0, 255, 0.5)' : 'rgba(139, 69, 19, 1)';
    const semiMajorAxis = orbitStep * (index + 1);
    const semiMinorAxis = semiMajorAxis * (0.75 + Math.random() * 0.25); // Elliptical adjustment
    return { planetSize, planetColor, semiMajorAxis, semiMinorAxis };
});

const bar = new ProgressBar('Generating frames [:bar] :percent :etas', {
    complete: '=',
    incomplete: ' ',
    width: 40,
    total: numFrames
});

for (let frame = 0; frame < numFrames; frame++) {
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');
    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);
    drawSun(context);

    planetDetails.forEach(({ planetSize, planetColor, semiMajorAxis, semiMinorAxis }, index) => {
        const angle = (2 * Math.PI * frame / numFrames) + (2 * Math.PI / items.length) * index; // Adjust for unique orbit
        const orbitRadius = Math.sqrt(Math.pow(semiMajorAxis * Math.cos(angle), 2) + Math.pow(semiMinorAxis * Math.sin(angle), 2));
        drawPlanet(context, orbitRadius, angle, planetSize, planetColor);
    });

    fs.writeFileSync(`${tempDir}/frame-${frame.toString().padStart(4, '0')}.png`, canvas.toBuffer('image/png'));
    bar.tick();
}

const videoOutputPath = path.join(outputDir, 'filesystem_visualization.mp4');
exec(`ffmpeg -framerate 60 -i ${tempDir}/frame-%04d.png -c:v libx264 -pix_fmt yuv420p -vf "scale=1280:720" ${videoOutputPath}`, (error) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }
    console.log('Video created: ' + videoOutputPath);
});
