const fs = require('fs');
const { createCanvas } = require('canvas');

const width = 1000;
const height = 1000;
const canvas = createCanvas(width, height);
const context = canvas.getContext('2d');

// Fill the background
context.fillStyle = '#000000'; // Dark background
context.fillRect(0, 0, width, height);

// Lattice configuration with some organic variation
const latticeSpacing = 150; // Average distance between lattice points
const maxAtomRadius = 20; // Maximum radius of atoms in the lattice
const maxParticleRadius = 5; // Maximum radius of particles associated with each atom

// Function to introduce randomness
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

// Draw a single atom and its associated particles
function drawAtomWithParticles(atomX, atomY) {
    // Draw the central atom with random size and color
    const atomRadius = getRandomArbitrary(maxAtomRadius - 5, maxAtomRadius);
    const atomHue = getRandomArbitrary(0, 360);
    context.fillStyle = `hsl(${atomHue}, 100%, 50%)`;
    context.beginPath();
    context.arc(atomX, atomY, atomRadius, 0, Math.PI * 2, false);
    context.fill();

    // Calculate particle positions around the atom to form a tetrahedral arrangement
    const offsets = [
        { x: -1, y: -1 }, { x: 1, y: -1 },
        { x: -1, y: 1 }, { x: 1, y: 1 }
    ];

    // Draw particles with some randomness in position, size, and color
    offsets.forEach(offset => {
        const particleRadius = getRandomArbitrary(maxParticleRadius - 2, maxParticleRadius);
        const particleDistance = atomRadius + particleRadius * 2 + getRandomArbitrary(-5, 5);
        const particleX = atomX + offset.x * particleDistance;
        const particleY = atomY + offset.y * particleDistance;

        const particleHue = getRandomArbitrary(0, 360);
        context.fillStyle = `hsla(${particleHue}, 100%, 70%, 0.8)`;
        context.beginPath();
        context.arc(particleX, particleY, particleRadius, 0, Math.PI * 2, false);
        context.fill();
    });
}

// Create an organic crystal lattice by iterating over a grid pattern with randomness
for (let x = 0; x < width; x += latticeSpacing) {
    for (let y = 0; y < height; y += latticeSpacing) {
        // Introduce randomness in position
        const offsetX = getRandomArbitrary(-10, 10);
        const offsetY = getRandomArbitrary(-10, 10);
        drawAtomWithParticles(x + offsetX, y + offsetY);
    }
}

// Save the canvas as a JPEG image at 100% quality
const out = fs.createWriteStream(__dirname + '/organicCrystalLatticeSimulation.jpg');
const stream = canvas.createJPEGStream({
    quality: 1 // Set quality to 100%
});
stream.pipe(out);
out.on('finish', () => console.log('The JPEG file was created.'));
