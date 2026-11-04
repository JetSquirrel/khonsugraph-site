"""Extract the gold route painted into hero-traces.png as a transparent "lit" layer.

The layer holds the illustration's own pixels, so it registers exactly when placed
over the image. Usage: glow.py <hero-traces.png> <out.webp> <preview.png>
"""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

src, out, preview = sys.argv[1:4]
im = Image.open(src).convert('RGB')
W, H = im.size
a = np.asarray(im, dtype=np.float32) / 255

# Rough route, used only to decide which pixels belong to it.
route = [(372,674),(402,659),(470,634),(527,620),(565,607),(587,590),(577,568),(603,549),(649,527),(708,526),(760,505),(801,464),(862,475),(927,482),(1020,440),(1094,357),(1160,364),(1222,361),(1282,320),(1343,239)]
band = Image.new('L', (W, H), 0)
d = ImageDraw.Draw(band)
d.line(route, fill=255, width=52, joint='curve')
for x, y in route:
    d.ellipse((x - 26, y - 26, x + 26, y + 26), fill=255)
band = band.filter(ImageFilter.GaussianBlur(7))
band = np.asarray(band, dtype=np.float32) / 255

# Gold-ness: bright and warm. Faint stars and hairlines fall below the threshold.
lum = a @ np.array([.3, .59, .11], dtype=np.float32)
warm = np.clip((a[..., 0] - a[..., 2]) * 3 + .35, 0, 1)
core = np.clip((lum - .3) / .35, 0, 1) * warm * band
# The ivory cliff under the traveler's feet is as bright as the route; keep only the sky.
ys, xs = np.mgrid[0:H, 0:W]
core[(ys > 678) & (xs < 460)] = 0

# Bloom comes from the extracted line itself, so it cannot drift from it either.
core_img = Image.fromarray((core * 255).astype(np.uint8))
near = np.asarray(core_img.filter(ImageFilter.GaussianBlur(5)), dtype=np.float32) / 255
far = np.asarray(core_img.filter(ImageFilter.GaussianBlur(18)), dtype=np.float32) / 255
alpha = np.clip(core + near * 1.1 + far * 1.2, 0, 1)
tint = np.array([1, .86, .56], dtype=np.float32)
white = np.array([1, .96, .84], dtype=np.float32)
rgb = tint + (white - tint) * core[..., None]
layer = np.dstack([rgb, alpha])
result = Image.fromarray((layer * 255).astype(np.uint8), 'RGBA')
result.save(out, 'WEBP', quality=82, alpha_quality=80, method=6)
black = Image.new('RGBA', (W, H), (0, 0, 0, 255))
black.alpha_composite(result)
black.convert('RGB').save(preview)
