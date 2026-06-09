#!/usr/bin/env python3
"""Genera iconos PNG reales para CoPadres PWA — Python stdlib puro."""
import struct, zlib, math, os

# ── Colores del branding CoPadres ────────────────
C_GREEN  = (0x52, 0xC8, 0x96, 255)   # fondo
C_WHITE  = (255, 255, 255, 255)       # recuadro interior
C_DARK   = (0x1B, 0x4D, 0x3E, 255)   # adulto izquierdo
C_TEAL   = (0x3A, 0xAB, 0xA6, 255)   # adulto derecho + niño
C_TRANS  = (0, 0, 0, 0)

def lerp_color(src, dst, t):
    t = max(0.0, min(1.0, t))
    return tuple(int(s + (d - s) * t) for s, d in zip(src, dst))

def blend(base, color, alpha):
    """Alpha composite color sobre base."""
    a = alpha / 255.0
    return (
        int(base[0] * (1-a) + color[0] * a),
        int(base[1] * (1-a) + color[1] * a),
        int(base[2] * (1-a) + color[2] * a),
        min(255, base[3] + int(alpha * (1.0 - base[3]/255.0)))
    )

class Canvas:
    def __init__(self, w, h):
        self.w, self.h = w, h
        self.buf = [[(0,0,0,0)] * w for _ in range(h)]

    def set(self, x, y, color, alpha=255):
        if 0 <= x < self.w and 0 <= y < self.h:
            self.buf[y][x] = blend(self.buf[y][x], color[:3] + (255,), alpha)

    def fill_rect(self, x0, y0, x1, y1, color):
        for y in range(max(0,y0), min(self.h, y1+1)):
            for x in range(max(0,x0), min(self.w, x1+1)):
                self.buf[y][x] = color

    def fill_rounded_rect(self, x0, y0, x1, y1, r, color):
        """Rectángulo redondeado con anti-aliasing en las esquinas."""
        r = min(r, (x1-x0)//2, (y1-y0)//2)
        for y in range(max(0, y0-1), min(self.h, y1+2)):
            for x in range(max(0, x0-1), min(self.w, x1+2)):
                fx, fy = x + 0.5, y + 0.5
                in_h = x0 <= fx <= x1
                in_v = y0 <= fy <= y1
                if not (in_h and in_v):
                    continue
                # distancia al borde redondeado de la esquina más cercana
                in_corner = (fx < x0+r and fy < y0+r) or \
                            (fx > x1-r and fy < y0+r) or \
                            (fx < x0+r and fy > y1-r) or \
                            (fx > x1-r and fy > y1-r)
                if in_corner:
                    cx = x0+r if fx < x0+r else x1-r
                    cy = y0+r if fy < y0+r else y1-r
                    d = math.hypot(fx-cx, fy-cy)
                    a = max(0, min(255, int(255 * (r - d + 0.5))))
                else:
                    a = 255
                if a > 0:
                    self.set(x, y, color, a)

    def fill_circle(self, cx, cy, r, color):
        """Círculo relleno con anti-aliasing."""
        for y in range(max(0, int(cy-r-1)), min(self.h, int(cy+r+2))):
            for x in range(max(0, int(cx-r-1)), min(self.w, int(cx+r+2))):
                d = math.hypot(x+0.5-cx, y+0.5-cy)
                a = max(0, min(255, int(255 * (r - d + 0.5))))
                if a > 0:
                    self.set(x, y, color, a)

    def fill_ellipse_arc(self, cx, cy_top, rx, ry, color):
        """Semielipse (mitad inferior) — para cuerpos de las figuras."""
        for y in range(max(0, int(cy_top)), min(self.h, int(cy_top+ry+2))):
            for x in range(max(0, int(cx-rx-1)), min(self.w, int(cx+rx+2))):
                nx = (x + 0.5 - cx) / rx
                ny = (y + 0.5 - cy_top) / ry
                d = math.hypot(nx, ny)
                a = max(0, min(255, int(255 * (1.0 - d + 0.5/rx))))
                if a > 0:
                    self.set(x, y, color, a)

    def to_png(self):
        raw = b''
        for row in self.buf:
            raw += b'\x00'
            for r,g,b,a in row:
                raw += bytes([r,g,b,a])
        compressed = zlib.compress(raw, 9)
        def chunk(tag, data):
            c = zlib.crc32(tag + data) & 0xffffffff
            return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', c)
        png  = b'\x89PNG\r\n\x1a\n'
        png += chunk(b'IHDR', struct.pack('>II', self.w, self.h) + bytes([8,6,0,0,0]))
        png += chunk(b'IDAT', compressed)
        png += chunk(b'IEND', b'')
        return png


def draw_copadres_icon(s):
    """Dibuja el ícono oficial de CoPadres en un canvas s×s."""
    c = Canvas(s, s)
    pad = int(s * 0.0)
    rr  = int(s * 0.22)

    # 1. Fondo verde redondeado
    c.fill_rounded_rect(pad, pad, s-pad-1, s-pad-1, rr, C_GREEN)

    # 2. Recuadro blanco interior
    ip = int(s * 0.08)
    ir = int(s * 0.14)
    c.fill_rounded_rect(ip, ip, s-ip-1, s-ip-1, ir, C_WHITE)

    # 3. Adulto izquierdo — oscuro (#1B4D3E)
    a1x = s * 0.34
    a1y = s * 0.32
    hr1 = s * 0.13       # radio cabeza
    br1 = s * 0.155      # radio cuerpo horizontal
    bh1 = s * 0.33       # alto cuerpo
    c.fill_circle(a1x, a1y, hr1, C_DARK)
    c.fill_ellipse_arc(a1x, a1y + hr1 * 0.7, br1, bh1, C_DARK)

    # 4. Adulto derecho — teal (#3AABA6)
    a2x = s * 0.64
    a2y = s * 0.29
    hr2 = s * 0.115
    br2 = s * 0.135
    bh2 = s * 0.35
    c.fill_circle(a2x, a2y, hr2, C_TEAL)
    c.fill_ellipse_arc(a2x, a2y + hr2 * 0.7, br2, bh2, C_TEAL)

    # 5. Niño centro — teal (#3AABA6), más abajo
    kx = s * 0.50
    ky = s * 0.49
    hk = s * 0.085
    bk = s * 0.10
    bkh = s * 0.26
    c.fill_circle(kx, ky, hk, C_TEAL)
    c.fill_ellipse_arc(kx, ky + hk * 0.7, bk, bkh, C_TEAL)

    return c


# ── Generar los 3 iconos ──────────────────────────
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'copadres-v14', 'assets')
os.makedirs(OUT, exist_ok=True)

for size, fname in [(512, 'icon-512.png'), (192, 'icon-192.png'), (180, 'apple-touch-icon.png')]:
    print(f'  {fname} ({size}×{size})... ', end='', flush=True)
    canvas = draw_copadres_icon(size)
    data = canvas.to_png()
    with open(os.path.join(OUT, fname), 'wb') as f:
        f.write(data)
    print(f'{len(data):,} bytes ✅')

print('\n✅ Iconos PNG generados con branding CoPadres.')
