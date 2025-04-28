import https from 'https';
import fs from 'fs';
import path from 'path';

const sounds = [
  {
    name: 'default',
    url: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'
  },
  {
    name: 'bell',
    url: 'https://assets.mixkit.co/active_storage/sfx/2868/2868-preview.mp3'
  },
  {
    name: 'chime',
    url: 'https://assets.mixkit.co/active_storage/sfx/2867/2867-preview.mp3'
  },
  {
    name: 'digital',
    url: 'https://assets.mixkit.co/active_storage/sfx/2866/2866-preview.mp3'
  },
  {
    name: 'gentle',
    url: 'https://assets.mixkit.co/active_storage/sfx/2865/2865-preview.mp3'
  }
];

const soundsDir = path.join(process.cwd(), 'public', 'sounds');

// Create sounds directory if it doesn't exist
if (!fs.existsSync(soundsDir)) {
  fs.mkdirSync(soundsDir, { recursive: true });
}

// Download each sound
sounds.forEach(sound => {
  const filePath = path.join(soundsDir, `${sound.name}.mp3`);
  const file = fs.createWriteStream(filePath);

  https.get(sound.url, response => {
    response.pipe(file);

    file.on('finish', () => {
      file.close();
      console.log(`Downloaded ${sound.name}.mp3`);
    });
  }).on('error', err => {
    fs.unlink(filePath, () => {});
    console.error(`Error downloading ${sound.name}.mp3:`, err.message);
  });
}); 