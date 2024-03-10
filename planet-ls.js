const { createCanvas } = require('canvas');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const ProgressBar = require('progress');

const width = 1280;
const height = 720;
const numFrames = 600; // Represents the animation length in frames
const tempDir = path.join(__dirname, 'temp_frames');

if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

const items = fs.readdirSync(process.cwd());
const maxSize = Math.max(...items.map(item => fs.statSync(path.join(process.cwd(), item)).size));

// Function to calculate the size of a file or total size of files in a directory
function getSize(itemPath) {
    const stats = fs.statSync(itemPath);
    if (stats.isDirectory()) {
        return fs.readdirSync(itemPath).reduce((total, file) => total + getSize(path.join(itemPath, file)), 0);
    } else {
        return stats.size;
    }
}

const planetDetails = items.map((item, index) => {
    const itemPath = path.join(process.cwd(), item);
    const stats = fs.statSync(itemPath);
    const size = stats.isDirectory() ? getSize(itemPath) : stats.size;
    const planetSize = 5 + (size / maxSize) * 20; // Relative scaling of planet size
    const planetColor = stats.isDirectory() ? 'rgba(0, 0, 255, 0.5)' : 'rgba(139, 69, 19, 1)';
    const orbitPeriod = 100 + index * 50; // Unique orbital period for each planet
    const semiMajorAxis = 150 + index * 30; // Unique semi-major axis for each planet
    const semiMinorAxis = semiMajorAxis * (0.75 + 0.25 * Math.random()); // Slightly randomize for elliptical orbit
    return { planetSize, planetColor, orbitPeriod, semiMajorAxis, semiMinorAxis };
});

const bar = new ProgressBar('Generating frames [:bar] :percent :etas', {
    complete: '=',
    incomplete: ' ',
    width: 40,
    total: numFrames
});

// Draw sun at the center
function drawSun(context) {
    context.beginPath();
    context.arc(width / 2, height / 2, 50, 0, 2 * Math.PI);
    context.fillStyle = 'yellow';
    context.fill();
}

for (let frame = 0; frame < numFrames; frame++) {
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');
    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);
    drawSun(context);

    planetDetails.forEach(({ planetSize, planetColor, orbitPeriod, semiMajorAxis, semiMinorAxis }, index) => {
        // Calculate the angle for the current frame
        const angle = (2 * Math.PI * (frame % orbitPeriod)) / orbitPeriod;
        // Calculate the position based on the elliptical orbit
        const posX = width / 2 + semiMajorAxis * Math.cos(angle);
        const posY = height / 2 + semiMinorAxis * Math.sin(angle);

        context.beginPath();
        context.arc(posX, posY, planetSize, 0, 2 * Math.PI);
        context.fillStyle = planetColor;
        context.fill();
    });

    fs.writeFileSync(`${tempDir}/frame-${frame.toString().padStart(4, '0')}.png`, canvas.toBuffer('image/png'));
    bar.tick();
}

// Compile the frames into a video
exec(`ffmpeg -framerate 60 -i ${tempDir}/frame-%04d.png -c:v libx264 -pix_fmt yuv420p -vf "scale=1280:720" filesystem_visualization.mp4`, (error) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }
    console.log('Video created: filesystem_visualization.mp4');
});
