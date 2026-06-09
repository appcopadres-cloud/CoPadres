#!/usr/bin/env python3
"""CoPadres — QR Card profesional rediseñado"""
import qrcode, math, os, io, cairosvg
from PIL import Image, ImageDraw, ImageFont, ImageFilter

URL = "https://appcopadres-cloud.github.io/CoPadres/"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "copadres-v14", "assets")
os.makedirs(OUT, exist_ok=True)

# ── Paleta ────────────────────────────────────────────────────────
DARK    = (13,  77,  71)
GREEN   = (82,  200, 150)
TEAL    = (58,  171, 166)
WHITE   = (255, 255, 255)
OFF_BG  = (245, 250, 248)   # fondo muy suave
LIGHT   = (220, 243, 235)   # chip
SUB     = (90,  120, 112)
BLACK   = (20,  30,  28)

def font(size, bold=False):
    paths = [
        f"/usr/share/fonts/truetype/dejavu/DejaVuSans{'-Bold' if bold else ''}.ttf",
        f"/usr/share/fonts/truetype/liberation/LiberationSans{'-Bold' if bold else '-Regular'}.ttf",
    ]
    for p in paths:
        if os.path.exists(p): return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def text_w(txt, f): return f.getbbox(txt)[2] - f.getbbox(txt)[0]
def text_h(txt, f): return f.getbbox(txt)[3] - f.getbbox(txt)[1]

# ── Logo CoPadres (SVG oficial) ───────────────────────────────────
_LOGO_SVG = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" rx="220" fill="#52C896"/>
  <rect x="90" y="90" width="844" height="844" rx="160" fill="#FFFFFF"/>
  <circle cx="360" cy="330" r="115" fill="#1B4D3E"/>
  <path d="M160 780 Q160 490 360 490 Q560 490 560 780Z" fill="#1B4D3E"/>
  <circle cx="630" cy="310" r="105" fill="#3AABA6"/>
  <path d="M430 780 Q430 480 630 480 Q830 480 830 780Z" fill="#3AABA6"/>
  <circle cx="500" cy="480" r="78" fill="#3AABA6"/>
  <path d="M340 780 Q340 570 500 570 Q660 570 660 780Z" fill="#3AABA6"/>
</svg>'''

def make_logo(size):
    png = cairosvg.svg2png(bytestring=_LOGO_SVG.encode(), output_width=size, output_height=size)
    return Image.open(io.BytesIO(png)).convert("RGBA")

# ── QR ────────────────────────────────────────────────────────────
def make_qr(size):
    qr = qrcode.QRCode(version=4, error_correction=qrcode.constants.ERROR_CORRECT_H,
                       box_size=12, border=2)
    qr.add_data(URL); qr.make(fit=True)
    img = qr.make_image(fill_color=DARK, back_color=WHITE).convert("RGBA")
    return img.resize((size,size), Image.LANCZOS)

def embed_logo_qr(qr_img, logo_d):
    logo = make_logo(logo_d)
    ring = logo_d + 18
    ri   = Image.new("RGBA",(ring,ring),(0,0,0,0))
    ImageDraw.Draw(ri).ellipse([0,0,ring-1,ring-1], fill=(*WHITE,255))
    off  = (ring-logo_d)//2
    ri.paste(logo,(off,off),logo)
    cx,cy = (qr_img.width-ring)//2, (qr_img.height-ring)//2
    out = qr_img.copy()
    out.paste(ri,(cx,cy),ri)
    return out

# ── Tarjeta Principal (1080×1560) ─────────────────────────────────
def build_main():
    W, H = 1080, 1560
    card = Image.new("RGB",(W,H), WHITE)
    d    = ImageDraw.Draw(card)

    # --- Franja superior verde oscuro con degradado simulado ---
    for y in range(420):
        t = y/420
        r = int(DARK[0]*(1-t) + 18*t)
        g = int(DARK[1]*(1-t) + 90*t)
        b = int(DARK[2]*(1-t) + 80*t)
        d.rectangle([0,y,W,y+1], fill=(r,g,b))

    # --- Logo grande centrado arriba ---
    logo_sz = 130
    logo    = make_logo(logo_sz)
    lx = (W-logo_sz)//2
    card.paste(logo, (lx, 56), logo)

    # --- Nombre app ---
    f_name = font(68, bold=True)
    f_tag  = font(26)
    name   = "CoPadres"
    d.text(((W-text_w(name,f_name))//2, 204), name, font=f_name, fill=WHITE)
    tag = "Crianza compartida · Familias conectadas"
    d.text(((W-text_w(tag,f_tag))//2, 286), tag, font=f_tag, fill=(180,225,210))

    # --- Tarjeta blanca con QR ---
    card_x, card_y = 60, 370
    card_w, card_h = W-120, 760
    card_r = 40

    # Sombra de tarjeta
    shadow = Image.new("RGBA",(card_w+40, card_h+40),(0,0,0,0))
    ImageDraw.Draw(shadow).rounded_rectangle([0,0,card_w+39,card_h+39], radius=card_r+6, fill=(0,0,0,35))
    shadow = shadow.filter(ImageFilter.GaussianBlur(18))
    card.paste(shadow.convert("RGB"), (card_x-8, card_y+8),
               shadow.split()[3])

    # Tarjeta blanca
    d.rounded_rectangle([card_x, card_y, card_x+card_w, card_y+card_h],
                         radius=card_r, fill=WHITE)

    # Línea decorativa verde arriba de la tarjeta
    d.rounded_rectangle([card_x, card_y, card_x+card_w, card_y+8],
                         radius=card_r, fill=GREEN)

    # QR centrado en la tarjeta
    qr_sz = 520
    qr    = make_qr(qr_sz)
    qr    = embed_logo_qr(qr, 90)

    # Marco redondeado para el QR
    qr_frame = Image.new("RGBA",(qr_sz,qr_sz),(0,0,0,0))
    mask = Image.new("L",(qr_sz,qr_sz),0)
    ImageDraw.Draw(mask).rounded_rectangle([0,0,qr_sz-1,qr_sz-1], radius=20, fill=255)
    qr_rgb = qr.convert("RGB")
    qr_frame.paste(qr_rgb, (0,0))
    qr_rgba = Image.composite(qr_frame, Image.new("RGBA",(qr_sz,qr_sz),(0,0,0,0)), mask)

    qx = card_x + (card_w-qr_sz)//2
    qy = card_y + 48
    card.paste(qr_rgba.convert("RGB"), (qx, qy))

    # Texto bajo el QR
    f_scan = font(34, bold=True)
    f_url  = font(22)
    scan_t = "Escanea para instalar la app"
    d.text(((W-text_w(scan_t,f_scan))//2, qy+qr_sz+28), scan_t, font=f_scan, fill=DARK)
    url_t = "appcopadres-cloud.github.io/CoPadres"
    d.text(((W-text_w(url_t,f_url))//2, qy+qr_sz+76), url_t, font=f_url, fill=TEAL)

    # Chips plataformas
    chips = ["Android", "iPhone", "PC / Mac"]
    f_chip= font(24, bold=True)
    chip_h, px, py, gap = 44, 22, 12, 14
    total = sum(text_w(c,f_chip)+px*2 for c in chips) + gap*(len(chips)-1)
    cx2   = (W-total)//2
    cy2   = qy+qr_sz+116
    for ch in chips:
        cw2 = text_w(ch,f_chip)+px*2
        d.rounded_rectangle([cx2,cy2,cx2+cw2,cy2+chip_h], radius=22, fill=LIGHT)
        d.text((cx2+px, cy2+py), ch, font=f_chip, fill=DARK)
        cx2 += cw2+gap

    # --- Sección inferior: título + descripción ---
    ty = card_y + card_h + 48
    f_title = font(46, bold=True)
    title   = "Escanea y comienza a coparentar mejor"
    # wrap title
    words = title.split(); lines=[]; cur=""
    for w in words:
        t2=(cur+" "+w).strip()
        if text_w(t2,f_title)<=W-120: cur=t2
        else:
            if cur: lines.append(cur)
            cur=w
    if cur: lines.append(cur)
    for line in lines:
        d.text(((W-text_w(line,f_title))//2, ty), line, font=f_title, fill=DARK)
        ty += text_h(line,f_title)+10
    ty += 20

    # Descripción
    f_desc = font(28)
    desc   = ("CoPadres conecta a las familias en un espacio seguro para organizar "
              "visitas, gastos, acuerdos, calendario compartido, chat protegido "
              "y herramientas de bienestar para los hijos.")
    words2=desc.split(); lines2=[]; cur2=""
    for w in words2:
        t2=(cur2+" "+w).strip()
        if text_w(t2,f_desc)<=W-160: cur2=t2
        else:
            if cur2: lines2.append(cur2)
            cur2=w
    if cur2: lines2.append(cur2)
    for line in lines2:
        d.text(((W-text_w(line,f_desc))//2, ty), line, font=f_desc, fill=SUB)
        ty += text_h(line,f_desc)+8
    ty += 36

    # --- Pasos de instalación ---
    steps = [
        ("1", "Abre la cámara de tu celular"),
        ("2", "Apunta al código QR"),
        ("3", "Toca el enlace que aparece"),
        ("4", "Toca 'Agregar a pantalla de inicio'"),
    ]
    f_sn = font(22, bold=True)
    f_st = font(24)
    step_h = 44
    sx = 80
    for num, txt in steps:
        # Burbuja numerada
        bubble = Image.new("RGBA",(step_h,step_h),(0,0,0,0))
        ImageDraw.Draw(bubble).ellipse([0,0,step_h-1,step_h-1], fill=(*GREEN,255))
        nx = (step_h-text_w(num,f_sn))//2
        ny = (step_h-text_h(num,f_sn))//2 - 1
        ImageDraw.Draw(bubble).text((nx,ny), num, font=f_sn, fill=DARK)
        card.paste(bubble, (sx, ty), bubble)
        d.text((sx+step_h+14, ty+10), txt, font=f_st, fill=DARK)
        ty += step_h + 14

    # --- Footer ---
    fy = H-72
    d.rectangle([0,fy-1,W,fy+1], fill=LIGHT)
    f_ft = font(22)
    ft   = "copadres.app  ·  Crianza compartida con amor y tecnología"
    d.text(((W-text_w(ft,f_ft))//2, fy+18), ft, font=f_ft, fill=SUB)
    # Barra verde inferior
    d.rectangle([0,H-10,W,H], fill=GREEN)

    return card

# ── Tarjeta WhatsApp compacta (1080×1080) ─────────────────────────
def build_square():
    W = H = 1080
    card = Image.new("RGB",(W,H), DARK)
    d    = ImageDraw.Draw(card)

    # Degradado sutil
    for y in range(H):
        t = y/H
        r = int(DARK[0]*(1-t)+22*t)
        g = int(DARK[1]*(1-t)+100*t)
        b = int(DARK[2]*(1-t)+88*t)
        d.rectangle([0,y,W,y+1], fill=(r,g,b))

    # Círculo decorativo fondo
    d.ellipse([-180,-180,480,480], fill=(255,255,255,12) if False else (20,90,83))
    d.ellipse([700,600,1200,1200], fill=(25,100,92))

    # Logo
    logo_sz = 110
    logo    = make_logo(logo_sz)
    lx      = (W-logo_sz)//2
    card.paste(logo,(lx,72),logo)

    f_name = font(58,bold=True)
    f_sub2 = font(24)
    d.text(((W-text_w("CoPadres",f_name))//2, 200), "CoPadres", font=f_name, fill=WHITE)
    sub2 = "Crianza compartida"
    d.text(((W-text_w(sub2,f_sub2))//2, 272), sub2, font=f_sub2, fill=(*GREEN, 200))

    # QR sobre fondo blanco redondeado
    qr_sz = 460
    qr    = make_qr(qr_sz)
    qr    = embed_logo_qr(qr, 80)

    pad = 28
    bg_sz = qr_sz + pad*2
    bg = Image.new("RGB",(bg_sz,bg_sz), WHITE)
    mask2 = Image.new("L",(bg_sz,bg_sz),0)
    ImageDraw.Draw(mask2).rounded_rectangle([0,0,bg_sz-1,bg_sz-1], radius=28, fill=255)

    bg_rgba = Image.new("RGBA",(bg_sz,bg_sz),(0,0,0,0))
    bg_rgba.paste(bg,(0,0))
    bg_final = Image.composite(bg_rgba, Image.new("RGBA",(bg_sz,bg_sz),(0,0,0,0)), mask2)

    bx = (W-bg_sz)//2
    by = 320
    card.paste(bg_final.convert("RGB"),(bx,by))
    card.paste(qr.convert("RGB"),(bx+pad, by+pad))

    # Texto bajo QR
    f_sc = font(30,bold=True)
    f_u2 = font(20)
    sc = "Escanea para instalar gratis"
    d.text(((W-text_w(sc,f_sc))//2, by+bg_sz+28), sc, font=f_sc, fill=WHITE)
    url2 = "appcopadres-cloud.github.io/CoPadres"
    d.text(((W-text_w(url2,f_u2))//2, by+bg_sz+70), url2, font=f_u2, fill=(*GREEN,))

    # Chips
    chips = ["Android", "iPhone", "PC"]
    f_ch2 = font(22,bold=True)
    ch_h,cpx,cpy,cgap = 38,18,10,12
    tot2  = sum(text_w(c,f_ch2)+cpx*2 for c in chips)+cgap*(len(chips)-1)
    ccx   = (W-tot2)//2
    ccy   = by+bg_sz+110
    for ch in chips:
        cw3 = text_w(ch,f_ch2)+cpx*2
        d.rounded_rectangle([ccx,ccy,ccx+cw3,ccy+ch_h], radius=19, fill=(255,255,255,30) if False else (30,100,92))
        d.text((ccx+cpx,ccy+cpy), ch, font=f_ch2, fill=WHITE)
        ccx += cw3+cgap

    # Tagline
    f_tg = font(22)
    tg   = "Organiza visitas · Gastos · Acuerdos · Chat protegido"
    d.text(((W-text_w(tg,f_tg))//2, H-62), tg, font=f_tg, fill=(180,225,210))

    return card

print("Generando QR profesional...\n")
main_path   = os.path.join(OUT, "copadres-qr-card.png")
square_path = os.path.join(OUT, "copadres-qr-card-small.png")

main   = build_main()
square = build_square()

main.save(main_path,   "PNG", optimize=True)
square.save(square_path, "PNG", optimize=True)
print(f"  QR principal (1080×1560): {os.path.getsize(main_path):,} bytes  ✅")
print(f"  QR cuadrado  (1080×1080): {os.path.getsize(square_path):,} bytes  ✅")
print("\n✅ Listo.")
