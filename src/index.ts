import { exiftool } from "exiftool-vendored";
import sharp from "sharp";
import fs from "fs";
import path from "path";

interface ImageGenConfig {
  filename?: string;
  width?: number;
  height?: number;
  outDir?: string;
}

function getConfigFromJson(): Required<ImageGenConfig> {
  const configPath = process.argv[2];
  let config: ImageGenConfig = {};

  if (configPath && fs.existsSync(configPath)) {
    try {
      const raw = fs.readFileSync(configPath, "utf-8");
      config = JSON.parse(raw);
      console.log(`Loaded configuration from: ${configPath}`);
    } catch (e) {
      console.error("Failed to parse config JSON, using defaults.", e);
    }
  } else {
    console.log(
      "No configuration file provided or file not found, using defaults.",
    );
  }

  const finalConfig = {
    filename:
      config.filename && typeof config.filename === "string"
        ? config.filename
        : "example",
    width:
      config.width && typeof config.width === "number" ? config.width : 1000,
    height:
      config.height && typeof config.height === "number" ? config.height : 300,
    outDir:
      config.outDir && typeof config.outDir === "string"
        ? config.outDir
        : "./output",
  };

  console.log("Configuration:", finalConfig);
  return finalConfig;
}

async function generateImages() {
  const { filename, width, height, outDir } = getConfigFromJson();

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
    console.log(`Created output directory: ${outDir}`);
  }

  const targets = [
    { ext: "jpg", sharpType: "jpeg" as const },
    { ext: "tiff", sharpType: "tiff" as const },
    { ext: "webp", sharpType: "webp" as const },
    { ext: "png", sharpType: "png" as const },
    { ext: "gif", sharpType: "gif" as const },
  ];

  // GPS data for Tokyo, Japan (decimal degrees format required by exiftool-vendored)
  const gps = {
    GPSLatitudeRef: "N",
    GPSLatitude: 35.6895,
    GPSLongitudeRef: "E",
    GPSLongitude: 139.6917,
    GPSAltitudeRef: "0",
    GPSAltitude: 44,
    GPSTimeStamp: "12:00:00",
    GPSSatellites: "U",
    GPSStatus: "A",
    GPSMeasureMode: "2",
    GPSDOP: 1,
    GPSSpeedRef: "K",
    GPSSpeed: 0,
    GPSTrackRef: "T",
    GPSTrack: 0,
    GPSImgDirectionRef: "T",
    GPSImgDirection: 0,
    GPSMapDatum: "WGS-84",
    GPSDateStamp: "2025:07:25",
    GPSDifferential: "0",
  };

  // EXIF metadata
  const exif = {
    AllDates: "2025:07:25 12:00:00",
    DateTimeOriginal: "2025:07:25 12:00:00",
    DateTimeDigitized: "2025:07:25 12:00:00",
    ImageDescription: "Test image for EXIF/GPS extraction",
    Make: "TestCamera",
    Model: "TestModel 1.0",
    Software: "ImageInfoTest",
    Copyright: "(C) 2025 Example",
    UserComment: "Test comment for EXIF extraction",
    FlashpixVersion: "0100",
    ColorSpace: "sRGB",
    PixelXDimension: width,
    PixelYDimension: height,
    ...gps,
  };

  console.log(`Generating ${targets.length} images...`);

  for (const { ext, sharpType } of targets) {
    const outPath = path.join(outDir, `${filename}.${ext}`);

    try {
      const sharpInstance = sharp({
        create: {
          width: Number(width),
          height: Number(height),
          channels: 3,
          background: { r: 200, g: 200, b: 200 },
        },
      });

      let outputInstance;
      switch (sharpType) {
        case "jpeg":
          outputInstance = sharpInstance.jpeg();
          break;
        case "png":
          outputInstance = sharpInstance.png();
          break;
        case "webp":
          outputInstance = sharpInstance.webp();
          break;
        case "tiff":
          outputInstance = sharpInstance.tiff();
          break;
        case "gif":
          outputInstance = sharpInstance.gif();
          break;
        default:
          throw new Error(`Unsupported format: ${sharpType}`);
      }

      await outputInstance.toFile(outPath);
      console.log(`✓ Generated image: ${outPath}`);

      // Embed EXIF/GPS metadata using exiftool
      try {
        await exiftool.write(outPath, exif, ["-overwrite_original"]);
        console.log(`✓ EXIF/GPS metadata written to: ${outPath}`);
      } catch (e) {
        console.warn(`⚠ EXIF not written to ${outPath}:`, e);
      }
    } catch (error) {
      console.error(`✗ Failed to generate ${outPath}:`, error);
    }
  }

  // Clean up exiftool process
  await exiftool.end();
  console.log("✓ Image generation complete!");
}

async function main() {
  try {
    await generateImages();
  } catch (error) {
    console.error("Error generating images:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { generateImages, getConfigFromJson };
export type { ImageGenConfig };
