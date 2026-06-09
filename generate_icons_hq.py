#!/usr/bin/env python3
"""
CoPadres — Generador de iconos HQ con supersampling 4x
Logo real: fondo verde sólido, dos adultos solapados (sin niño).
Izquierda: verde oscuro. Derecha: teal claro, más grande y adelante.
"""
import os
from PIL import Image, ImageDraw, ImageFilter

# Colores corporativos reales extraídos del logo oficial
C_BG_GREEN    = (0x4C, 0xBF, 0x7A, 255)   # fondo verde brillante
C_FIGURE_DARK = (0x1B, 0x5E, 0x45, 255)   # figura izquierda verde oscuro
C_FIGURE_TEAL = (0x3B, 0xBB, 0xB5, 255)   # figura derecha teal/cyan
C_TRANSPARENT = (0, 0, 0, 0)

SCALE = 4  # supersampling multiplier


def draw_icon(size):
    s = size * SCALE
    img = Image.new("RGBA", (s, s), C_TRANSPARENT)
    d = ImageDraw.Draw(img)

    # 1. Fondo verde redondeado (esquinas ~22%)
    rr = int(s * 0.22)
    d.rounded_rectangle([0, 0, s-1, s-1], radius=rr, fill=C_BG_GREEN)

    def figure(d_obj, cx, head_cy, head_r, color):
        """Dibuja cabeza + cuerpo semielipse."""
        # Cabeza
        d_obj.ellipse([cx - head_r, head_cy - head_r,
                       cx + head_r, head_cy + head_r], fill=color)
        # Cuerpo: semielipse (parte superior de una elipse)
        bw = int(head_r * 1.35)
        bh = int(head_r * 2.6)
        by = head_cy + int(head_r * 0.55)
        # Dibuja elipse completa y tapa la mitad inferior con rectángulo del mismo color
        d_obj.ellipse([cx - bw, by, cx + bw, by + bh], fill=color)
        d_obj.rectangle([cx - bw, by + bh // 2, cx + bw, by + bh], fill=C_BG_GREEN)

    # 2. Figura izquierda — verde oscuro, ligeramente más pequeña y detrás
    f1_cx = int(s * 0.41)
    f1_cy = int(s * 0.37)
    f1_r  = int(s * 0.118)
    figure(d, f1_cx, f1_cy, f1_r, C_FIGURE_DARK)

    # 3. Figura derecha — teal claro, más grande y delante (solapada)
    f2_cx = int(s * 0.59)
    f2_cy = int(s * 0.33)
    f2_r  = int(s * 0.135)
    figure(d, f2_cx, f2_cy, f2_r, C_FIGURE_TEAL)

    # Suavizar aliasing del supersampling
    img = img.filter(ImageFilter.GaussianBlur(radius=SCALE * 0.35))

    # Bajar a resolución final con LANCZOS
    return img.resize((size, size), Image.LANCZOS)


def save_png(img, path):
    img.save(path, "PNG", optimize=True, compress_level=9)
    print(f"  {os.path.basename(path):30s}  {img.size[0]}x{img.size[1]}  {os.path.getsize(path):,} bytes  OK")


OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'copadres-v14', 'assets')
os.makedirs(OUT, exist_ok=True)

print("Generando iconos HQ con logo real CoPadres...\n")
for size, fname in [(512, 'icon-512.png'), (192, 'icon-192.png'), (180, 'apple-touch-icon.png')]:
    save_png(draw_icon(size), os.path.join(OUT, fname))
print("\nIconos generados.")
