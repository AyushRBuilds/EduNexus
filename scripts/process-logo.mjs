import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputPath = path.join(__dirname, '..', 'public', 'images', 'logo.png');
const outputPath = path.join(__dirname, '..', 'public', 'images', 'logo-clean.png');

async function processLogo() {
  try {
    // Read the image
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    console.log(`Input image: ${metadata.width}x${metadata.height}, channels: ${metadata.channels}`);

    // Get the raw pixel buffer
    const { data, info } = await image
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    console.log(`Raw buffer: ${info.width}x${info.height}, channels: ${info.channels}`);

    // Process pixels - remove white/near-white background
    const pixels = Buffer.from(data);
    const threshold = 230; // Pixels with R,G,B all above this are considered "white background"
    const edgeThreshold = 200; // Slightly more aggressive for edge cleanup

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];

      // Pure white / near-white background -> fully transparent
      if (r > threshold && g > threshold && b > threshold) {
        pixels[i + 3] = 0; // Set alpha to 0
      }
      // Semi-white areas (anti-aliasing edges) -> proportional transparency
      else if (r > edgeThreshold && g > edgeThreshold && b > edgeThreshold) {
        const brightness = (r + g + b) / 3;
        const alpha = Math.round(255 * (1 - (brightness - edgeThreshold) / (255 - edgeThreshold)));
        pixels[i + 3] = Math.min(pixels[i + 3], alpha);
      }
    }

    // Write the processed image
    await sharp(pixels, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4,
      },
    })
      .png()
      .toFile(outputPath);

    console.log(`Processed logo saved to: ${outputPath}`);

    // Also create a trimmed version (auto-crop transparent areas)
    const trimmedPath = path.join(__dirname, '..', 'public', 'images', 'logo-trimmed.png');
    await sharp(outputPath)
      .trim()
      .png()
      .toFile(trimmedPath);

    const trimmedMeta = await sharp(trimmedPath).metadata();
    console.log(`Trimmed logo: ${trimmedMeta.width}x${trimmedMeta.height}`);
    console.log(`Trimmed logo saved to: ${trimmedPath}`);

  } catch (error) {
    console.error('Error processing logo:', error);
    process.exit(1);
  }
}

processLogo();
