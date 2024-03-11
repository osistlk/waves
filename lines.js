const fs = require('fs');
const { createCanvas } = require('canvas');

const width = 1000;
const height = 1000;
const canvas = createCanvas(width, height);
const context = canvas.getContext('2d');

// Fill the background
context.fillStyle = '#000000'; // Dark background for contrast
context.fillRect(0, 0, width, height);

function drawAtom(x, y, numParticles) {
    // Draw the central atom, a larger circle
    const atomRadius = Math.random() * 10 + 20; // Atom radius between 20 and 30
    context.fillStyle = `hsl(${Math.random() * 360}, 100%, 50%)`;
    context.beginPath();
    context.arc(x, y, atomRadius, 0, Math.PI * 2, false);
    context.fill();

    // Draw the particles, smaller circles
    for (let i = 0; i < numParticles; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 30 + atomRadius + 5; // Distance from atom center
        const particleX = x + distance * Math.cos(angle);
        const particleY = y + distance * Math.sin(angle);
        const particleRadius = Math.random() * 3 + 1; // Particle radius between 1 and 4

        context.fillStyle = `hsla(${Math.random() * 360}, 100%, 70%, 0.8)`; // Lighter color for particles
        context.beginPath();
        context.arc(particleX, particleY, particleRadius, 0, Math.PI * 2, false);
        context.fill();
    }
}

// Decide on the number of atoms to draw
const numAtoms = 50;

for (let i = 0; i < numAtoms; i++) {
    // Random positions for atoms
    const x = Math.random() * width;
    const y = Math.random() * height;
    // Random number of particles for each atom, from 5 to 15
    const numParticles = Math.floor(Math.random() * 10) + 5;

    drawAtom(x, y, numParticles);
}

// Save the canvas as a JPEG image at 100% quality
const out = fs.createWriteStream(__dirname + '/filledWithAtomsAndParticles.jpg');
const stream = canvas.createJPEGStream({
    quality: 1 // Set quality to 100%
});
stream.pipe(out);
out.on('finish', () => console.log('The JPEG file was created.'));
