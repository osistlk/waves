const fs = require('fs');
const { createCanvas } = require('canvas');

const width = 1000;
const height = 1000;
const canvas = createCanvas(width, height);
const context = canvas.getContext('2d');

// Background color - Dark mode theme
context.fillStyle = '#000000'; // Dark background
context.fillRect(0, 0, width, height);

// Function to draw a larger particle and its orbiting smaller particles
function drawOrbitingParticles(centralX, centralY, orbitRadius, numberOfOrbits, particlesPerOrbit) {
    for (let i = 0; i < numberOfOrbits; i++) {
        let currentOrbitRadius = orbitRadius + i * 20; // Increment the orbit radius for each orbit

        // Draw the orbit
        context.strokeStyle = '#FFFFFF';
        context.beginPath();
        context.arc(centralX, centralY, currentOrbitRadius, 0, 2 * Math.PI, false);
        context.stroke();

        // Draw smaller particles along the orbit
        for (let j = 0; j < particlesPerOrbit; j++) {
            // Calculate the particle position on the orbit
            let angle = (2 * Math.PI / particlesPerOrbit) * j;
            let particleX = centralX + currentOrbitRadius * Math.cos(angle);
            let particleY = centralY + currentOrbitRadius * Math.sin(angle);

            context.fillStyle = `hsl(${Math.random() * 360}, 100%, 50%)`; // Random color
            context.beginPath();
            context.arc(particleX, particleY, 5, 0, 2 * Math.PI, false); // Smaller particle size
            context.fill();
        }
    }

    // Draw the larger central particle
    context.fillStyle = '#FFD700'; // Gold color for the central particle
    context.beginPath();
    context.arc(centralX, centralY, 20, 0, 2 * Math.PI, false); // Larger particle size
    context.fill();
}

// Draw several sets of orbiting particles
drawOrbitingParticles(width * 0.3, height * 0.5, 40, 3, 8); // Position 1
drawOrbitingParticles(width * 0.7, height * 0.5, 40, 3, 8); // Position 2

// Save the canvas as a JPEG image at 100% quality
const out = fs.createWriteStream(__dirname + '/orbitingParticlesSimulation.jpg');
const stream = canvas.createJPEGStream({
    quality: 1 // Set quality to 100%
});
stream.pipe(out);
out.on('finish', () => console.log('The JPEG file was created.'));
