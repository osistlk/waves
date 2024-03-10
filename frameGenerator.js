const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');
const { workerData, parentPort } = require('worker_threads');

process.on('message', ({ startFrame, endFrame, tempDir }) => {
    for (let frame = startFrame; frame <= endFrame; frame++) {
        // Frame generation logic here
        const canvas = createCanvas(1280, 720); // Adjusted for 720p
        const context = canvas.getContext('2d');
        // Example drawing logic (replace with actual frame generation code)
        context.fillStyle = `rgb(${frame % 255}, ${(frame * 2) % 255}, ${(frame * 3) % 255})`;
        context.fillRect(0, 0, 1280, 720);

        const framePath = path.join(tempDir, `frame-${frame.toString().padStart(4, '0')}.png`);
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(framePath, buffer);
    }

    process.send({ pid: process.pid, status: 'completed' });
});
