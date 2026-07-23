from PIL import Image, ImageDraw

SIZE = 128
OUT = "icons/icon128.png"

img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Red rounded-square background (YouTube-style)
draw.rounded_rectangle([4, 4, SIZE - 4, SIZE - 4], radius=28, fill=(255, 0, 0, 255))

# White clock face
cx, cy, r = SIZE // 2, SIZE // 2, 44
draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, 255, 255, 255))

# Clock hands (pointing to ~2 o'clock, suggesting time passing)
draw.line([cx, cy, cx, cy - 28], fill=(255, 0, 0, 255), width=6)
draw.line([cx, cy, cx + 20, cy - 10], fill=(255, 0, 0, 255), width=6)
draw.ellipse([cx - 5, cy - 5, cx + 5, cy + 5], fill=(255, 0, 0, 255))

img.save(OUT)
print(f"wrote {OUT}")
