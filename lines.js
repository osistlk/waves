const fs = require('fs');
const { createCanvas } = require('canvas');

const width = 1000;
const height = 1000;
const canvas = createCanvas(width, height);
const context = canvas.getContext('2d');

// Background color - Dark mode theme
context.fillStyle = '#000000'; // Dark background
context.fillRect(0, 0, width, height);

// Set properties for the surface and particle
context.strokeStyle = '#FFFFFF'; // Light color for visibility
context.lineWidth = 5;

// Draw the surface
const surfaceY = height * 0.8; // Position of the surface from the top
context.beginPath();
context.moveTo(0, surfaceY);
context.lineTo(width, surfaceY);
context.stroke();

// Calculate and draw the particle's trajectory at a 45-degree angle towards the surface
const particleStartX = width * 0.5;
const particleStartY = height * 0.2;
const impactPointX = width * 0.7; // Adjust this value as needed
const impactPointY = surfaceY;

// Draw trajectory
context.setLineDash([5, 15]); // Dashed line for the trajectory
context.beginPath();
context.moveTo(particleStartX, particleStartY);
context.lineTo(impactPointX, impactPointY);
context.stroke();

// Draw particle at the starting point
context.setLineDash([]); // Reset to solid line
context.beginPath();
context.arc(particleStartX, particleStartY, 10, 0, 2 * Math.PI, false); // Particle size
context.fillStyle = '#FF0000'; // Particle color
context.fill();

// Highlight the impact point
context.beginPath();
context.arc(impactPointX, impactPointY, 10, 0, 2 * Math.PI, false);
context.fillStyle = '#FFFF00'; // Impact point color
context.fill();

// Save the canvas as a JPEG image at 100% quality
const out = fs.createWriteStream(__dirname + '/particleImpactSimulation.jpg');
const stream = canvas.createJPEGStream({
    quality: 1 // Set quality to 100%
});
stream.pipe(out);
out.on('finish', () => console.log('The JPEG file was created.'));
