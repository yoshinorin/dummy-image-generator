# Test Image Generator

A utility to generate test images with embedded EXIF/GPS metadata.

## Usage

### Command Line

```bash
# Build the project
npm run build

# Generate images with default configuration
npm generate

# Use custom configuration file
npm generate <your_config.json>
```

### Configuration File

Customize image generation with a JSON file:

```json
// example
{
  "filename": "example",
  "width": 1000,
  "height": 300,
  "outDir": "./output"
}
```

#### Configuration Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `filename` | string | "example" | Generated image filename (without extension) |
| `width` | number | 1000 | Image width in pixels |
| `height` | number | 300 | Image height in pixels |
| `outDir` | string | "./output" | Output directory path |

## Generated Files

The following 5 files are generated with the specified filename:

- `{filename}.jpg` - JPEG format
- `{filename}.png` - PNG format
- `{filename}.tiff` - TIFF format
- `{filename}.webp` - WebP format
- `{filename}.gif` - GIF format

All files contain the same embedded EXIF/GPS metadata.
