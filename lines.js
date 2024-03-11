const fs = require('fs');
const { createCanvas } = require('canvas');

const width = 1000;
const height = 1000;
const canvas = createCanvas(width, height);
const context = canvas.getContext('2d');

// Background color - Dark mode theme
context.fillStyle = '#000000'; // Dark background
context.fillRect(0, 0, width, height);

// Function to draw an orbiting particle system
function drawOrbitingParticles(centralX, centralY, numberOfOrbits) {
    // Draw the larger central particle
    const centralParticleRadius = Math.random() * 15 + 10; // Radius between 10 and 25
    context.fillStyle = '#FFD700'; // Gold color for the central particle
    context.beginPath();
    context.arc(centralX, centralY, centralParticleRadius, 0, 2 * Math.PI, false);
    context.fill();

    // Draw each orbit with particles
    for (let i = 0; i < numberOfOrbits; i++) {
        let orbitRadius = centralParticleRadius + Math.random() * 50 + 30; // Randomize orbit radius
        let particlesPerOrbit = Math.floor(Math.random() * 10 + 5); // Random number of particles per orbit

        for (let j = 0; j < particlesPerOrbit; j++) {
            let angle = Math.random() * 2 * Math.PI; // Random angle for each particle
            let particleX = centralX + orbitRadius * Math.cos(angle);
            let particleY = centralY + orbitRadius * Math.sin(angle);

            // Draw the smaller particle
            const particleRadius = Math.random() * 3 + 2; // Radius between 2 and 5
            context.fillStyle = `hsla(${Math.random() * 360}, 100%, 50%, 0.8)`; // Random color with some transparency
            context.beginPath();
            context.arc(particleX, particleY, particleRadius, 0, 2 * Math.PI, false);
            context.fill();
        }
    }
}

// Number of particle systems and their positions
const particleSystems = [
    { x: width * 0.3, y: height * 0.5 },
    { x: width * 0.7, y: height * 0.5 },
];

// Draw multiple particle systems
particleSystems.forEach(system => {
    drawOrbitingParticles(system.x, system.y, Math.floor(Math.random() * 4 + 3)); // 3 to 6 orbits
});

// Save the canvas as a JPEG image at 100% quality
const out = fs.createWriteStream(__dirname + '/organicOrbitingParticlesSimulation.jpg');
const stream = canvas.createJPEGStream({
    quality: 1 // Set quality to 100%
});
stream.pipe(out);
out.on('finish', () => console.log('The JPEG file was created.'));
