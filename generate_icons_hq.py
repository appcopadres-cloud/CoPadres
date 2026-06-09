#!/usr/bin/env python3
"""
CoPadres — Genera iconos desde el SVG oficial de la marca.
Variante: fondo verde #52C896, interior blanco, 3 figuras.
"""
import os, cairosvg
from PIL import Image
import io

# SVG oficial — variante "Fondo Verde" extraída del sistema de marca
SVG = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" rx="220" fill="#52C896"/>
  <rect x="90" y="90" width="844" height="844" rx="160" fill="#FFFFFF"/>
  <circle cx="360" cy="330" r="115" fill="#1B4D3E"/>
  <path d="M160 780 Q160 490 360 490 Q560 490 560 780Z" fill="#1B4D3E"/>
  <circle cx="630" cy="310" r="105" fill="#3AABA6"/>
  <path d="M430 780 Q430 480 630 480 Q830 480 830 780Z" fill="#3AABA6"/>
  <circle cx="500" cy="480" r="78" fill="#3AABA6"/>
  <path d="M340 780 Q340 570 500 570 Q660 570 660 780Z" fill="#3AABA6"/>
</svg>'''

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'copadres-v14', 'assets')
os.makedirs(OUT, exist_ok=True)

print("Generando iconos desde SVG oficial...\n")

for size, fname in [(512, 'icon-512.png'), (192, 'icon-192.png'), (180, 'apple-touch-icon.png')]:
    png_bytes = cairosvg.svg2png(bytestring=SVG.encode(), output_width=size, output_height=size)
    img = Image.open(io.BytesIO(png_bytes))
    path = os.path.join(OUT, fname)
    img.save(path, "PNG", optimize=True, compress_level=9)
    print(f"  {fname:30s}  {size}x{size}  {os.path.getsize(path):,} bytes  OK")

print("\nIconos generados desde SVG oficial.")
