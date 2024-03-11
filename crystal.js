const fs = require('fs');
const { createCanvas } = require('canvas');

const width = 1000;
const height = 1000;
const canvas = createCanvas(width, height);
const context = canvas.getContext('2d');

// Fill the background
context.fillStyle = '#000000'; // Dark background
context.fillRect(0, 0, width, height);

// Lattice configuration
const latticeSpacing = 150; // Distance between lattice points
const atomRadius = 20; // Radius of atoms in the lattice
const particleRadius = 5; // Radius of particles associated with each atom

// Draw a single atom and its associated particles
function drawAtomWithParticles(atomX, atomY) {
    // Draw the central atom
    context.fillStyle = '#FFD700'; // Gold color for the central atom
    context.beginPath();
    context.arc(atomX, atomY, atomRadius, 0, Math.PI * 2, false);
    context.fill();

    // Calculate particle positions around the atom to form a tetrahedral arrangement
    const offsets = [
        { x: -1, y: -1 }, { x: 1, y: -1 },
        { x: -1, y: 1 }, { x: 1, y: 1 }
    ];

    // Draw particles
    offsets.forEach(offset => {
        const particleX = atomX + offset.x * particleRadius * 3; // 3 times the radius for spacing
        const particleY = atomY + offset.y * particleRadius * 3;

        context.fillStyle = '#FFFFFF'; // White color for particles
        context.beginPath();
        context.arc(particleX, particleY, particleRadius, 0, Math.PI * 2, false);
        context.fill();
    });
}

// Create crystal lattice by iterating over a grid pattern
for (let x = 0; x < width; x += latticeSpacing) {
    for (let y = 0; y < height; y += latticeSpacing) {
        // Offset every other row to create a staggered effect
        const offsetX = (y / latticeSpacing) % 2 * (latticeSpacing / 2);
        drawAtomWithParticles(x + offsetX, y);
    }
}

// Save the canvas as a JPEG image at 100% quality
const out = fs.createWriteStream(__dirname + '/crystalLatticeSimulation.jpg');
const stream = canvas.createJPEGStream({
    quality: 1 // Set quality to 100%
});
stream.pipe(out);
out.on('finish', () => console.log('The JPEG file was created.'));
