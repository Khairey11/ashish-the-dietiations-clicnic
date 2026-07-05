"""
Remove the white background from the logo and save as transparent PNG.
Also crop to the bounding box of the non-white content.
"""
from PIL import Image
import sys

INPUT = "/home/z/my-project/upload/as.jpeg"
OUTPUT = "/home/z/my-project/public/logo-transparent.png"

# Open the original JPEG
img = Image.open(INPUT).convert("RGBA")
pixels = img.load()
width, height = img.size

# Threshold: any pixel that is "near white" (all RGB channels >= 240) becomes fully transparent.
# We use a tolerance so anti-aliased edges don't leave a white halo.
THRESHOLD = 240
new_data = []
for y in range(height):
    for x in range(width):
        r, g, b, a = pixels[x, y]
        if r >= THRESHOLD and g >= THRESHOLD and b >= THRESHOLD:
            # Make white pixels fully transparent
            new_data.append((255, 255, 255, 0))
        else:
            # Keep the original pixel, but darken near-white edge pixels slightly
            # to remove the white halo from anti-aliasing
            if r > 230 and g > 230 and b > 230:
                # Edge pixel — reduce white contribution
                new_data.append((min(r, 200), min(g, 200), min(b, 200), a))
            else:
                new_data.append((r, g, b, a))

img.putdata(new_data)

# Crop to the bounding box of non-transparent content
bbox = img.getbbox()
if bbox:
    img = img.crop(bbox)

# Save as PNG (preserves alpha channel)
img.save(OUTPUT, "PNG")
print(f"✅ Transparent logo saved to {OUTPUT}")
print(f"   Original size: {width}x{height}")
print(f"   Cropped size: {img.size[0]}x{img.size[1]}")
print(f"   File size: {__import__('os').path.getsize(OUTPUT)} bytes")
