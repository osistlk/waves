const { createCanvas } = require('canvas');
const fs = require('fs');
const { exec } = require('child_process');

const width = 1280;
const height = 720;
const numFrames = 60;
const particles = [];
const numParticles = 100;

// Initialize particles
for (let i = 0; i < numParticles; i++) {
    particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10
    });
}

// Function to update and draw particles
function drawFrame(frameIndex) {
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');

    // Dark mode background
    context.fillStyle = '#000';
    context.fillRect(0, 0, width, height);

    // Draw particles
    particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Reflect particles off walls
        if (particle.x <= 0 || particle.x >= width) particle.vx *= -1;
        if (particle.y <= 0 || particle.y >= height) particle.vy *= -1;

        context.beginPath();
        context.arc(particle.x, particle.y, 5, 0, 2 * Math.PI);
        context.fillStyle = '#fff';
        context.fill();
    });

    const buffer = canvas.toBuffer('image/jpeg');
    fs.writeFileSync(`frame-${frameIndex.toString().padStart(3, '0')}.jpg`, buffer);
}

// Generate frames
for (let i = 0; i < numFrames; i++) {
    drawFrame(i);
}

// Use ffmpeg to create a video from the frames
exec(`ffmpeg -framerate 24 -i frame-%03d.jpg -c:v libx264 -pix_fmt yuv420p out.mp4`, (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }
    console.log('Video created: out.mp4');
});
