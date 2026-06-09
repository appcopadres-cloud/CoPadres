#!/usr/bin/env python3
"""
CoPadres — Generador de iconos HQ con supersampling 4x
Logo real: fondo blanco, borde teal redondeado, dos adultos (sin niño).
"""
import os
from PIL import Image, ImageDraw, ImageFilter

# Colores corporativos reales
C_TEAL_BORDER = (0x2B, 0xA8, 0x8E, 255)   # borde exterior teal
C_TEAL_LIGHT  = (0x4D, 0xC9, 0xC4, 255)   # figura derecha — teal claro
C_TEAL_DARK   = (0x1B, 0x6B, 0x5A, 255)   # figura izquierda — teal oscuro
C_WHITE       = (255, 255, 255, 255)
C_TRANSPARENT = (0, 0, 0, 0)

SCALE = 4  # supersampling multiplier


def draw_icon(size):
    s = size * SCALE
    img = Image.new("RGBA", (s, s), C_TRANSPARENT)
    d = ImageDraw.Draw(img)

    rr = int(s * 0.22)

    # 1. Fondo blanco con borde teal (stroke)
    border = int(s * 0.07)
    d.rounded_rectangle([0, 0, s-1, s-1], radius=rr, fill=C_TEAL_BORDER)
    d.rounded_rectangle([border, border, s-border-1, s-border-1],
                         radius=max(4, rr - border), fill=C_WHITE)

    def circle(cx, cy, r, color):
        d.ellipse([cx-r, cy-r, cx+r, cy+r], fill=color)

    def figure(cx, head_cy, head_r, color):
        # Cabeza
        circle(cx, head_cy, head_r, color)
        # Cuerpo — semielipse debajo de la cabeza
        by_top = head_cy + int(head_r * 0.6)
        bw = int(head_r * 1.25)
        bh = int(head_r * 2.2)
        d.ellipse([cx - bw, by_top, cx + bw, by_top + bh * 2], fill=color)
        d.rectangle([cx - bw, by_top, cx + bw, by_top + bh], fill=color)

    # 2. Figura izquierda — teal oscuro, ligeramente más abajo y atrás
    f1_cx  = int(s * 0.40)
    f1_cy  = int(s * 0.34)
    f1_hr  = int(s * 0.115)
    figure(f1_cx, f1_cy, f1_hr, C_TEAL_DARK)

    # 3. Figura derecha — teal claro, ligeramente más arriba y adelante
    f2_cx  = int(s * 0.60)
    f2_cy  = int(s * 0.31)
    f2_hr  = int(s * 0.125)
    figure(f2_cx, f2_cy, f2_hr, C_TEAL_LIGHT)

    # Suavizar bordes escalonados del supersampling
    img = img.filter(ImageFilter.GaussianBlur(radius=SCALE * 0.4))

    # Bajar a resolución final con LANCZOS
    out = img.resize((size, size), Image.LANCZOS)
    return out


def save_png(img, path):
    img.save(path, "PNG", optimize=True, compress_level=9)
    print(f"  {os.path.basename(path):30s}  {img.size[0]}x{img.size[1]}  {os.path.getsize(path):,} bytes  OK")


OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'copadres-v14', 'assets')
os.makedirs(OUT, exist_ok=True)

print("Generando iconos HQ con logo real (2 adultos, borde teal)...\n")

for size, fname in [(512, 'icon-512.png'), (192, 'icon-192.png'), (180, 'apple-touch-icon.png')]:
    icon = draw_icon(size)
    save_png(icon, os.path.join(OUT, fname))

print("\nIconos generados con logo real CoPadres.")
