#!/usr/bin/env python3
"""
CoPadres — Generador de tarjeta QR oficial
Diseño profesional estilo Apple/Notion con logo en el centro del QR
"""
import qrcode
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math, os, struct, zlib

# ── Colores corporativos ──────────────────────────────────────────
C_BG        = (255, 255, 255)          # fondo blanco
C_DARK      = (13,  77,  71)           # #0D4D47 verde oscuro
C_GREEN     = (82,  200, 150)          # #52C896 verde marca
C_TEAL      = (58,  171, 166)          # #3AABA6
C_SUB       = (100, 120, 118)          # subtítulo gris verdoso
C_CHIP_BG   = (232, 248, 243)          # fondo chip
C_CHIP_TEXT = (13,  77,  71)

URL = "https://appcopadres-cloud.github.io/CoPadres/"

# ── Tamaños ───────────────────────────────────────────────────────
CARD_W   = 1080
CARD_H   = 1600
QR_SIZE  = 520
LOGO_R   = 68          # radio del círculo logo dentro del QR
MARGIN   = 64


# ══════════════════════════════════════════════════════════════════
# 1. Generar QR con módulos redondeados
# ══════════════════════════════════════════════════════════════════
def make_qr(url, size):
    qr = qrcode.QRCode(
        version=4,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=2,
    )
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color=(13, 77, 71), back_color=(255, 255, 255))
    img = img.convert("RGBA")
    img = img.resize((size, size), Image.LANCZOS)
    return img


# ══════════════════════════════════════════════════════════════════
# 2. Dibujar logo CoPadres mini (igual que generate_icons.py)
# ══════════════════════════════════════════════════════════════════
def draw_logo_circle(diameter):
    """Círculo con fondo verde y la silueta del ícono CoPadres."""
    s = diameter
    c = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    draw = ImageDraw.Draw(c)

    # Círculo base con sombra suave
    draw.ellipse([0, 0, s-1, s-1], fill=(82, 200, 150, 255))

    # Figuras simplificadas: 2 adultos + 1 niño (círculos + trapezoides)
    def filled_circle(cx, cy, r, color):
        draw.ellipse([cx-r, cy-r, cx+r, cy+r], fill=color)

    def filled_body(cx, cy_top, rx, ry, color):
        draw.ellipse([cx-rx, cy_top, cx+rx, cy_top+ry*2], fill=color)

    pad = int(s * 0.10)
    # Fondo blanco redondeado interior
    ir = int(s * 0.14)
    ip = int(s * 0.09)
    draw.rounded_rectangle([ip, ip, s-ip, s-ip], radius=ir, fill=(255, 255, 255, 255))

    # Adulto izquierdo — oscuro
    a1x, a1y = int(s*0.34), int(s*0.33)
    hr1 = int(s*0.115)
    filled_circle(a1x, a1y, hr1, (27, 77, 62, 255))
    filled_body(a1x, a1y + int(hr1*0.6), int(s*0.135), int(s*0.28), (27, 77, 62, 255))

    # Adulto derecho — teal
    a2x, a2y = int(s*0.64), int(s*0.30)
    hr2 = int(s*0.10)
    filled_circle(a2x, a2y, hr2, (58, 171, 166, 255))
    filled_body(a2x, a2y + int(hr2*0.6), int(s*0.115), int(s*0.295), (58, 171, 166, 255))

    # Niño centro — teal más pequeño
    kx, ky = int(s*0.50), int(s*0.50)
    hk = int(s*0.075)
    filled_circle(kx, ky, hk, (58, 171, 166, 255))
    filled_body(kx, ky + int(hk*0.6), int(s*0.088), int(s*0.21), (58, 171, 166, 255))

    return c


# ══════════════════════════════════════════════════════════════════
# 3. Superponer logo en el centro del QR
# ══════════════════════════════════════════════════════════════════
def embed_logo(qr_img, logo_diameter):
    logo = draw_logo_circle(logo_diameter)

    # Añadir anillo blanco alrededor del logo
    ring = logo_diameter + 16
    ring_img = Image.new("RGBA", (ring, ring), (0, 0, 0, 0))
    rd = ImageDraw.Draw(ring_img)
    rd.ellipse([0, 0, ring-1, ring-1], fill=(255, 255, 255, 255))
    logo_offset = (ring - logo_diameter) // 2
    ring_img.paste(logo, (logo_offset, logo_offset), logo)

    cx = (qr_img.width  - ring) // 2
    cy = (qr_img.height - ring) // 2
    qr_img.paste(ring_img, (cx, cy), ring_img)
    return qr_img


# ══════════════════════════════════════════════════════════════════
# 4. Helpers de texto
# ══════════════════════════════════════════════════════════════════
def load_font(size, bold=False):
    paths = [
        f"/usr/share/fonts/truetype/dejavu/DejaVuSans{'-Bold' if bold else ''}.ttf",
        f"/usr/share/fonts/truetype/liberation/LiberationSans{'-Bold' if bold else '-Regular'}.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSans.ttf",
    ]
    for p in paths:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def draw_text_centered(draw, text, y, font, color, max_w, line_spacing=8):
    """Dibuja texto centrado con word wrap."""
    words = text.split()
    lines = []
    current = ""
    for w in words:
        test = (current + " " + w).strip()
        bbox = font.getbbox(test)
        if bbox[2] - bbox[0] <= max_w:
            current = test
        else:
            if current:
                lines.append(current)
            current = w
    if current:
        lines.append(current)

    total_h = 0
    for line in lines:
        bbox = font.getbbox(line)
        total_h += (bbox[3] - bbox[1]) + line_spacing

    yy = y
    for line in lines:
        bbox = font.getbbox(line)
        lw = bbox[2] - bbox[0]
        lh = bbox[3] - bbox[1]
        draw.text(((CARD_W - lw) // 2, yy), line, font=font, fill=color)
        yy += lh + line_spacing

    return yy  # retorna posición Y final


def rounded_rect(draw, x0, y0, x1, y1, r, fill):
    draw.rounded_rectangle([x0, y0, x1, y1], radius=r, fill=fill)


# ══════════════════════════════════════════════════════════════════
# 5. Componer tarjeta completa
# ══════════════════════════════════════════════════════════════════
def build_card():
    card = Image.new("RGBA", (CARD_W, CARD_H), C_BG + (255,))
    draw = ImageDraw.Draw(card)

    # — Barra superior de color ——————————————————————————————————
    draw.rectangle([0, 0, CARD_W, 12], fill=C_GREEN + (255,))

    # — Logo + nombre en header ——————————————————————————————————
    header_logo_d = 80
    logo_hdr = draw_logo_circle(header_logo_d)
    lx = (CARD_W - header_logo_d) // 2
    card.paste(logo_hdr, (lx, 48), logo_hdr)

    f_brand = load_font(52, bold=True)
    f_tagline = load_font(26)
    f_title = load_font(44, bold=True)
    f_body = load_font(28)
    f_small = load_font(22)
    f_chip = load_font(24, bold=True)
    f_url = load_font(21)

    # Nombre app
    name_y = 48 + header_logo_d + 18
    draw.text(((CARD_W - f_brand.getbbox("CoPadres")[2]) // 2, name_y),
              "CoPadres", font=f_brand, fill=C_DARK)

    # Tagline
    tagline_y = name_y + 62
    tl = "Crianza compartida · Familias conectadas"
    draw.text(((CARD_W - f_tagline.getbbox(tl)[2]) // 2, tagline_y),
              tl, font=f_tagline, fill=C_SUB)

    # Separador
    sep_y = tagline_y + 50
    draw.rectangle([MARGIN*2, sep_y, CARD_W - MARGIN*2, sep_y + 2],
                   fill=C_GREEN + (180,))

    # — Título principal ————————————————————————————————————————
    title_y = sep_y + 44
    title_end = draw_text_centered(draw,
        "Escanea y comienza a coparentar mejor",
        title_y, f_title, C_DARK, CARD_W - MARGIN*2, line_spacing=10)

    # — QR ——————————————————————————————————————————————————————
    qr_y = title_end + 36

    # Sombra del QR
    shadow = Image.new("RGBA", (QR_SIZE + 20, QR_SIZE + 20), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle([0, 0, QR_SIZE+19, QR_SIZE+19], radius=28,
                          fill=(0, 0, 0, 30))
    shadow = shadow.filter(ImageFilter.GaussianBlur(12))
    card.paste(shadow, ((CARD_W - QR_SIZE) // 2 - 4, qr_y + 4), shadow)

    # QR con borde redondeado
    qr_img = make_qr(URL, QR_SIZE)
    qr_frame = Image.new("RGBA", (QR_SIZE, QR_SIZE), (255, 255, 255, 255))
    mask = Image.new("L", (QR_SIZE, QR_SIZE), 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle([0, 0, QR_SIZE-1, QR_SIZE-1], radius=24, fill=255)
    qr_frame.paste(qr_img.convert("RGBA"), (0, 0), mask)
    qr_frame = Image.composite(qr_frame,
                                Image.new("RGBA", (QR_SIZE, QR_SIZE), (0,0,0,0)),
                                mask)

    # Logo centrado en QR
    logo_d = LOGO_R * 2
    qr_frame = embed_logo(qr_frame, logo_d)

    qx = (CARD_W - QR_SIZE) // 2
    card.paste(qr_frame, (qx, qr_y), qr_frame)

    # — URL bajo el QR ——————————————————————————————————————————
    url_y = qr_y + QR_SIZE + 22
    short_url = "appcopadres-cloud.github.io/CoPadres"
    draw.text(((CARD_W - f_url.getbbox(short_url)[2]) // 2, url_y),
              short_url, font=f_url, fill=C_TEAL)

    # — Chips de plataformas ————————————————————————————————————
    chips_y = url_y + 48
    chips = ["Android", "iPhone", "PC / Mac"]
    chip_pad_x, chip_pad_y = 22, 10
    gap = 16
    total_w = 0
    chip_sizes = []
    for ch in chips:
        bx = f_chip.getbbox(ch)
        w = bx[2] - bx[0] + chip_pad_x * 2
        h = bx[3] - bx[1] + chip_pad_y * 2
        chip_sizes.append((w, h))
        total_w += w + gap
    total_w -= gap

    cx = (CARD_W - total_w) // 2
    for i, (ch, (cw, ch_h)) in enumerate(zip(chips, chip_sizes)):
        rounded_rect(draw, cx, chips_y, cx + cw, chips_y + ch_h, 20,
                     C_CHIP_BG + (255,))
        bx = f_chip.getbbox(ch)
        tx = cx + chip_pad_x
        ty = chips_y + chip_pad_y
        draw.text((tx, ty), ch, font=f_chip, fill=C_CHIP_TEXT)
        cx += cw + gap

    # — Descripción ————————————————————————————————————————————
    desc_y = chips_y + chip_sizes[0][1] + 44
    desc_end = draw_text_centered(draw,
        "CoPadres conecta a las familias en un espacio seguro para organizar "
        "visitas, gastos, acuerdos, calendario compartido, chat protegido y "
        "herramientas de bienestar para los hijos.",
        desc_y, f_body, C_SUB, CARD_W - MARGIN*3, line_spacing=10)

    # — Instrucciones ——————————————————————————————————————————
    inst_y = desc_end + 44
    draw.rectangle([MARGIN*2, inst_y, CARD_W - MARGIN*2, inst_y + 2],
                   fill=(230, 245, 240, 255))
    inst_y += 28

    instructions = [
        ("1", "Abre la cámara de tu celular"),
        ("2", "Apunta al código QR"),
        ("3", "Toca el enlace que aparece"),
        ("4", 'En el menú del navegador → "Agregar a pantalla de inicio"'),
    ]

    f_step_num = load_font(22, bold=True)
    f_step_txt = load_font(22)
    step_gap = 18
    ix = MARGIN * 2 + 10

    for num, txt in instructions:
        # Círculo número
        circle_d = 34
        circ_img = Image.new("RGBA", (circle_d, circle_d), (0, 0, 0, 0))
        cd = ImageDraw.Draw(circ_img)
        cd.ellipse([0, 0, circle_d-1, circle_d-1], fill=C_GREEN + (255,))
        nb = f_step_num.getbbox(num)
        nx = (circle_d - (nb[2]-nb[0])) // 2
        ny = (circle_d - (nb[3]-nb[1])) // 2 - 1
        cd.text((nx, ny), num, font=f_step_num, fill=C_DARK)
        card.paste(circ_img, (ix, inst_y), circ_img)

        # Texto del paso
        draw.text((ix + circle_d + 12, inst_y + 6), txt,
                  font=f_step_txt, fill=C_DARK)
        inst_y += circle_d + step_gap

    # — Footer ————————————————————————————————————————————————
    footer_y = CARD_H - 80
    draw.rectangle([0, footer_y - 1, CARD_W, footer_y + 1],
                   fill=(230, 245, 240, 255))
    footer_txt = "copadres.app  ·  Crianza compartida con amor y tecnología"
    draw.text(((CARD_W - f_small.getbbox(footer_txt)[2]) // 2, footer_y + 18),
              footer_txt, font=f_small, fill=C_SUB)

    # Barra inferior de color
    draw.rectangle([0, CARD_H-8, CARD_W, CARD_H], fill=C_GREEN + (255,))

    return card.convert("RGB")


# ── Generar ──────────────────────────────────────────────────────
OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "copadres-v14", "assets")
os.makedirs(OUT_DIR, exist_ok=True)

print("Generando tarjeta QR oficial de CoPadres...")
card = build_card()

out_path = os.path.join(OUT_DIR, "copadres-qr-card.png")
card.save(out_path, "PNG", optimize=True)
print(f"✅ Guardado: {out_path}  ({os.path.getsize(out_path):,} bytes)")

# También guardar versión compacta para compartir por WhatsApp
card_small = card.resize((540, 800), Image.LANCZOS)
out_small = os.path.join(OUT_DIR, "copadres-qr-card-small.png")
card_small.save(out_small, "PNG", optimize=True)
print(f"✅ Guardado (small): {out_small}  ({os.path.getsize(out_small):,} bytes)")
