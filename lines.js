const fs = require('fs');
const { createCanvas } = require('canvas');

const width = 1000;
const height = 1000;
const canvas = createCanvas(width, height);
const context = canvas.getContext('2d');

// Background color - Dark mode theme
context.fillStyle = '#000000'; // Dark background
context.fillRect(0, 0, width, height);

// Set properties for the surface
context.strokeStyle = '#FFFFFF'; // Light color for the surface
context.lineWidth = 5;

// Draw the surface
const surfaceY = height * 0.8; // Position of the surface from the top
context.beginPath();
context.moveTo(0, surfaceY);
context.lineTo(width, surfaceY);
context.stroke();

// Function to draw a single particle and its trajectory
function drawParticle(particleStartX, particleStartY, impactPointX, impactPointY) {
    // Particle properties
    const particleSize = Math.random() * 5 + 5; // Size between 5 and 10
    const particleColor = `hsl(${Math.random() * 360}, 100%, 50%)`; // Random color
    const curveFactor = Math.random() * 100 - 50; // Random curvature factor

    // Draw trajectory
    context.setLineDash([5, 15]); // Dashed line for the trajectory
    context.beginPath();
    context.moveTo(particleStartX, particleStartY);
    // Create a quadratic curve for organic trajectory
    context.quadraticCurveTo(
        (particleStartX + impactPointX) / 2 + curveFactor,
        (particleStartY + impactPointY) / 2,
        impactPointX,
        impactPointY
    );
    context.stroke();

    // Draw particle at the starting point
    context.setLineDash([]); // Reset to solid line
    context.beginPath();
    context.arc(particleStartX, particleStartY, particleSize, 0, 2 * Math.PI, false); // Use particleSize
    context.fillStyle = particleColor; // Use particleColor
    context.fill();

    // Highlight the impact point
    context.beginPath();
    context.arc(impactPointX, impactPointY, particleSize, 0, 2 * Math.PI, false); // Use particleSize for impact point as well
    context.fillStyle = '#FFFF00'; // Impact point color
    context.fill();
}

// Simulate multiple particles
const numberOfParticles = 5;
for (let i = 0; i < numberOfParticles; i++) {
    const xOffset = (width / (numberOfParticles + 1)) * (i + 1);
    drawParticle(xOffset, height * 0.2, xOffset, surfaceY);
}

// Save the canvas as a JPEG image at 100% quality
const out = fs.createWriteStream(__dirname + '/organicParticlesImpactSimulation.jpg');
const stream = canvas.createJPEGStream({
    quality: 1 // Set quality to 100%
});
stream.pipe(out);
out.on('finish', () => console.log('The JPEG file was created.'));
