import sharp from "sharp";

const source = "public/logo.png";

const createIcon = async ({ size, output, scale, background }) => {
  const logo = await sharp(source)
    .resize({
      width: Math.round(size * scale),
      height: Math.round(size * scale),
      fit: "inside",
    })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background,
    },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(`public/${output}`);
};

await Promise.all([
  createIcon({
    size: 192,
    output: "pwa-192x192.png",
    scale: 0.78,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  }),
  createIcon({
    size: 512,
    output: "pwa-512x512.png",
    scale: 0.78,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  }),
  createIcon({
    size: 512,
    output: "pwa-maskable-512x512.png",
    scale: 0.66,
    background: "#f8fafc",
  }),
  createIcon({
    size: 180,
    output: "apple-touch-icon.png",
    scale: 0.66,
    background: "#f8fafc",
  }),
]);
