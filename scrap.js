import {tracks} from './tracks.js';
import {bulletSpots} from './bullet-spots.js';
import {mkdir} from 'fs/promises';
import https from 'https';
import {createWriteStream, unlink} from 'fs';
import {dirname, join} from 'path';
import {fileURLToPath} from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const downloadFile = async (url, outputPath) => {
    console.log('Downloading:', url);
    const outputDir = dirname(outputPath);
    await mkdir(outputDir, {recursive: true});
    const file = createWriteStream(outputPath);
    return new Promise((resolve, reject) => {
        https.get(url, response => {
            response.pipe(file);

            file.on('finish', () => {
                file.close();
                console.log('Download completed.');
                resolve();
            });
        }).on('error', err => {
            unlink(outputPath, () => { // Delete the file asynchronously
                console.error('Error downloading the file:', err.message);
                reject(err);
            });
        });
    });
};

const run = async () => {
    for (const track of tracks) {
        const code = track.code;
        const trackIconImage = `https://shortcat.pro/track-icon/${code}.png`
        const outputPath = join(__dirname, 'assets', 'track-icon', `${code}.png`);
        await downloadFile(trackIconImage, outputPath);
        const bullets = bulletSpots.filter(b => b.code === track.code);
        for (const bullet of bullets) {
            const number = bullet.number;
            const videoUrl = `https://shortcat.pro/bullet-spots/video/${code}-${number}.mp4`;
            const videoPath = join(__dirname, 'assets', 'bullet-spots', 'video', `${code}-${number}.mp4`);
            await downloadFile(videoUrl, videoPath);
            const imageUrl = `https://shortcat.pro/bullet-spots/image/${code}-${number}.png`;
            const imagePath = join(__dirname, 'assets', 'bullet-spots', 'image', `${code}-${number}.png`);
            await downloadFile(imageUrl, imagePath);
        }

    }
};

run();