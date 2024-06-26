const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

const dirPath = path.join(__dirname, 'temp');
const fps = 60;

// Get the list of JPEG files in the directory
const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.jpg') || file.endsWith('.jpeg'));

// sort files by the number in the filename
files.sort((a, b) => {
    const aNum = parseInt(a.match(/\d+/)[0]);
    const bNum = parseInt(b.match(/\d+/)[0]);
    return aNum - bNum;
});

// Write the list of files to a text file
const listPath = path.join(dirPath, 'files.txt');
fs.writeFileSync(listPath, files.map(file => `file '${path.join(dirPath, file)}'`).join('\n'));

// Use FFmpeg to create the video
const videoPath = path.join(dirPath, 'video.mp4');
child_process.execSync(`ffmpeg -f concat -safe 0 -i ${listPath} -c:v libx264 -pix_fmt yuv420p -r ${fps} ${videoPath}`);

// Remove the list file
fs.unlinkSync(listPath);
