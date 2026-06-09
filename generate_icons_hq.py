#!/usr/bin/env python3
"""
CoPadres — Generador de iconos HQ con supersampling 4x
Renderiza a 4x la resolución objetivo y baja con LANCZOS para máxima nitidez.
"""
import struct, zlib, math, os
from PIL import Image, ImageDraw, ImageFilter

# Colores corporativos
C_GREEN  = (0x52, 0xC8, 0x96, 255)
C_WHITE  = (255, 255, 255, 255)
C_DARK   = (0x1B, 0x4D, 0x3E, 255)
C_TEAL   = (0x3A, 0xAB, 0xA6, 255)

SCALE = 4  # supersampling


def draw_icon(size):
    """Dibuja el ícono CoPadres usando PIL a size*SCALE y baja a size."""
    s = size * SCALE
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # 1. Fondo verde redondeado
    rr = int(s * 0.22)
    d.rounded_rectangle([0, 0, s-1, s-1], radius=rr, fill=C_GREEN)

    # 2. Recuadro blanco interior
    ip = int(s * 0.08)
    ir = int(s * 0.14)
    d.rounded_rectangle([ip, ip, s-ip-1, s-ip-1], radius=ir, fill=C_WHITE)

    def circle(cx, cy, r, color):
        d.ellipse([cx-r, cy-r, cx+r, cy+r], fill=color)

    def body(cx, cy_top, rx, ry, color):
        # Semielipse inferior: trapecio superior redondeado
        d.ellipse([cx-rx, cy_top, cx+rx, cy_top+ry*2], fill=color)
        # Rellena la mitad superior del óvalo para hacerlo semielipse
        d.rectangle([cx-rx, cy_top, cx+rx, cy_top+ry], fill=color)

    # 3. Adulto izquierdo — oscuro (#1B4D3E)
    a1x = int(s * 0.34)
    a1y = int(s * 0.32)
    hr1 = int(s * 0.125)
    br1 = int(s * 0.148)
    bh1 = int(s * 0.30)
    circle(a1x, a1y, hr1, C_DARK)
    body(a1x, a1y + int(hr1 * 0.75), br1, bh1, C_DARK)

    # 4. Adulto derecho — teal (#3AABA6)
    a2x = int(s * 0.64)
    a2y = int(s * 0.29)
    hr2 = int(s * 0.108)
    br2 = int(s * 0.128)
    bh2 = int(s * 0.32)
    circle(a2x, a2y, hr2, C_TEAL)
    body(a2x, a2y + int(hr2 * 0.75), br2, bh2, C_TEAL)

    # 5. Niño centro — teal más pequeño
    kx  = int(s * 0.50)
    ky  = int(s * 0.49)
    hk  = int(s * 0.082)
    bk  = int(s * 0.096)
    bkh = int(s * 0.24)
    circle(kx, ky, hk, C_TEAL)
    body(kx, ky + int(hk * 0.75), bk, bkh, C_TEAL)

    # Aplicar leve blur para suavizar bordes escalonados del supersampling
    img = img.filter(ImageFilter.GaussianBlur(radius=SCALE * 0.4))

    # Bajar a tamaño final con LANCZOS (máxima calidad)
    out = img.resize((size, size), Image.LANCZOS)
    return out


def save_png(img, path):
    """Guarda como PNG optimizado con fondo transparente preservado."""
    img.save(path, "PNG", optimize=True, compress_level=9)
    print(f"  {os.path.basename(path):30s}  {img.size[0]}×{img.size[1]}  {os.path.getsize(path):,} bytes  ✅")


OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'copadres-v14', 'assets')
os.makedirs(OUT, exist_ok=True)

print("Generando iconos HQ con supersampling 4x...\n")

for size, fname in [(512, 'icon-512.png'), (192, 'icon-192.png'), (180, 'apple-touch-icon.png')]:
    icon = draw_icon(size)
    save_png(icon, os.path.join(OUT, fname))

print("\n✅ Iconos HQ generados con supersampling 4x — nitidez máxima.")
