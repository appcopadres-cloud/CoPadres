#!/usr/bin/env python3
"""Genera capturas de pantalla representativas de CoPadres v14."""
from PIL import Image, ImageDraw, ImageFont
import os

C_BG     = (248, 250, 252)
C_DARK   = (13,  77,  71)
C_GREEN  = (82,  200, 150)
C_TEAL   = (58,  171, 166)
C_WHITE  = (255, 255, 255)
C_SUB    = (107, 114, 128)
C_BORDER = (229, 231, 235)
C_NAV    = (13,  77,  71)
C_PURPLE = (124, 58,  237)
C_BLUE   = (37,  99,  235)
C_ORANGE = (234, 88,  12)
C_RED    = (220, 38,  38)

W, H = 390, 844  # iPhone 14 Pro dimensions

def load_font(size, bold=False):
    paths = [
        f"/usr/share/fonts/truetype/dejavu/DejaVuSans{'-Bold' if bold else ''}.ttf",
        f"/usr/share/fonts/truetype/liberation/LiberationSans{'-Bold' if bold else '-Regular'}.ttf",
    ]
    for p in paths:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def new_screen():
    img = Image.new("RGB", (W, H), C_BG)
    d = ImageDraw.Draw(img)
    return img, d

def draw_statusbar(d):
    d.rectangle([0, 0, W, 44], fill=C_DARK)
    f = load_font(13)
    d.text((16, 14), "9:41", font=f, fill=C_WHITE)
    d.text((W-60, 14), "●●●", font=f, fill=C_WHITE)

def draw_navbar(img, d, active=0):
    nb_h = 82
    d.rectangle([0, H-nb_h, W, H], fill=C_NAV)
    items = [("▦","Inicio"), ("💬","Mensajes"), ("📅","Calendario"), ("💳","Gastos"), ("•••","Más")]
    iw = W // len(items)
    f_ic = load_font(18)
    f_lb = load_font(10)
    for i, (ic, lb) in enumerate(items):
        cx = i * iw + iw // 2
        color = C_GREEN if i == active else (255, 255, 255, 180)
        if i == active:
            d.ellipse([cx-22, H-nb_h+6, cx+22, H-nb_h+50], fill=(255,255,255,30))
        d.text((cx - f_ic.getbbox(ic)[2]//2, H-nb_h+8), ic, font=f_ic, fill=C_GREEN if i==active else C_WHITE)
        d.text((cx - f_lb.getbbox(lb)[2]//2, H-nb_h+34), lb, font=f_lb, fill=C_GREEN if i==active else C_WHITE)

def rounded_rect(d, x0, y0, x1, y1, r, fill=None, outline=None, width=1):
    d.rounded_rectangle([x0,y0,x1,y1], radius=r, fill=fill, outline=outline, width=width)

# ── Screenshot 1: Dashboard ──────────────────────────────────────
def shot_dashboard():
    img, d = new_screen()
    draw_statusbar(d)
    # Header
    d.rectangle([0, 44, W, 130], fill=C_DARK)
    f_h = load_font(22, bold=True)
    f_s = load_font(13)
    d.text((20, 56), "Hola, Mamá 👋", font=f_h, fill=C_WHITE)
    d.text((20, 86), "Lunes 9 de Junio, 2026", font=f_s, fill=(180,220,210))
    # Avatar
    d.ellipse([W-64, 52, W-20, 96], fill=C_PURPLE)
    d.text((W-52, 62), "M", font=f_h, fill=C_WHITE)
    # Stats cards
    y0 = 144
    stats = [
        ("2","Hijos",C_BLUE),("4","Eventos",C_GREEN),
        ("$85K","Gastos",C_PURPLE),("1","Conflictos",C_ORANGE)
    ]
    cw = (W - 48) // 2
    for i, (val, lab, col) in enumerate(stats):
        cx = 16 + (i % 2) * (cw + 16)
        cy = y0 + (i // 2) * 96
        rounded_rect(d, cx, cy, cx+cw, cy+80, 16, fill=C_WHITE)
        d.rounded_rectangle([cx+12,cy+12,cx+44,cy+44], radius=10, fill=col+(20,) if len(col)==3 else col)
        d.ellipse([cx+12,cy+12,cx+44,cy+44], fill=col+(30,) if len(str(col))<20 else None)
        d.rounded_rectangle([cx+12,cy+12,cx+44,cy+44], radius=10, fill=(*col,40))
        fv = load_font(26, bold=True)
        fl = load_font(11)
        d.text((cx+56, cy+14), val, font=fv, fill=col)
        d.text((cx+14, cy+52), lab, font=fl, fill=C_SUB)
    # Próximos eventos
    ey = y0 + 210
    ftt = load_font(15, bold=True)
    ft = load_font(13)
    d.text((16, ey), "Próximos eventos", font=ftt, fill=C_DARK)
    events = [("Control médico","Sofía · Dr. Martínez","Salud",C_GREEN),
              ("Reunión colegio","Tomás · Apoderado","Legal",C_PURPLE)]
    for j, (ev, sub, tag, col) in enumerate(events):
        ry = ey + 32 + j * 68
        rounded_rect(d, 12, ry, W-12, ry+56, 12, fill=C_WHITE)
        d.rounded_rectangle([16, ry+8, 52, ry+48], radius=10, fill=C_BLUE)
        d.text((24, ry+14), "JUN", font=load_font(9), fill=C_WHITE)
        d.text((21, ry+26), str(15+j*3), font=load_font(16,True), fill=C_WHITE)
        d.text((60, ry+10), ev, font=load_font(13,True), fill=C_DARK)
        d.text((60, ry+30), sub, font=load_font(11), fill=C_SUB)
        tw = load_font(10).getbbox(tag)[2]+16
        rounded_rect(d, W-tw-20, ry+16, W-20, ry+40, 10, fill=(*col,30))
        d.text((W-tw-12, ry+20), tag, font=load_font(10), fill=col)
    draw_navbar(img, d, 0)
    return img

# ── Screenshot 2: Chat ───────────────────────────────────────────
def shot_chat():
    img, d = new_screen()
    draw_statusbar(d)
    d.rectangle([0, 44, W, 108], fill=C_DARK)
    f_h = load_font(18, bold=True)
    d.text((16, 58), "Chat entre padres", font=f_h, fill=C_WHITE)
    d.text((16, 84), "🛡 Filtro anti-ofensas activo", font=load_font(11), fill=(180,220,210))
    # Mensajes
    msgs = [
        ("Papá", "Confirmo que recojo a Sofía el viernes a las 17:00", False, "17:23"),
        ("Mamá", "Perfecto, recuerda traer el uniforme de danza", True, "17:25"),
        ("Papá", "Lo tengo listo. ¿Cómo está del resfriado?", False, "17:26"),
        ("Mamá", "Mucho mejor, ya sin fiebre desde ayer 🙂", True, "17:30"),
    ]
    my = 120
    for sender, text, is_me, time in msgs:
        bg = C_DARK if is_me else C_WHITE
        tc = C_WHITE if is_me else C_DARK
        max_w = 240
        bx = load_font(13).getbbox(text)
        tw = min(bx[2], max_w) + 24
        # simple wrap
        words = text.split()
        lines = []
        cur = ""
        for w in words:
            test = (cur+" "+w).strip()
            if load_font(13).getbbox(test)[2] <= max_w-20:
                cur = test
            else:
                if cur: lines.append(cur)
                cur = w
        if cur: lines.append(cur)
        bh = len(lines)*20 + 20
        bw = min(max(load_font(13).getbbox(l)[2] for l in lines)+28, max_w)
        bx0 = W-bw-16 if is_me else 16
        d.rounded_rectangle([bx0, my, bx0+bw, my+bh], radius=14, fill=bg)
        if not is_me:
            d.rounded_rectangle([bx0, my, bx0+bw, my+bh], radius=14, outline=C_BORDER, width=1)
        for li, line in enumerate(lines):
            d.text((bx0+12, my+10+li*20), line, font=load_font(12), fill=tc)
        d.text((bx0 if is_me else bx0+bw-30, my+bh+2), time, font=load_font(9), fill=C_SUB)
        my += bh + 28
    # Input bar
    rounded_rect(d, 12, H-148, W-12, H-96, 24, fill=C_WHITE, outline=C_BORDER, width=1)
    d.text((28, H-134), "Escribe un mensaje...", font=load_font(13), fill=C_SUB)
    d.ellipse([W-52, H-148, W-12, H-108], fill=C_GREEN)
    d.text((W-42, H-136), "▶", font=load_font(16), fill=C_WHITE)
    draw_navbar(img, d, 1)
    return img

# ── Screenshot 3: Calendario ─────────────────────────────────────
def shot_calendar():
    img, d = new_screen()
    draw_statusbar(d)
    d.rectangle([0, 44, W, 108], fill=C_DARK)
    d.text((16, 58), "Calendario", font=load_font(18,True), fill=C_WHITE)
    d.text((16, 84), "Junio 2026", font=load_font(13), fill=(180,220,210))
    # Grid calendario
    days = ["L","M","M","J","V","S","D"]
    cw2 = (W-32)//7
    dy = 120
    for i, day in enumerate(days):
        d.text((16+i*cw2+cw2//2-5, dy), day, font=load_font(11,True), fill=C_SUB)
    nums = [None,None,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30]
    highlights = {9: C_BLUE, 15: C_GREEN, 18: C_PURPLE, 22: C_ORANGE}
    today = 9
    dy2 = 144
    for i, num in enumerate(nums):
        if num is None: continue
        row = (i)//7
        col = i%7
        cx = 16 + col*cw2 + cw2//2
        cy = dy2 + row*44
        if num == today:
            d.ellipse([cx-16, cy-2, cx+16, cy+30], fill=C_DARK)
            d.text((cx-5, cy+4), str(num), font=load_font(13,True), fill=C_WHITE)
        elif num in highlights:
            d.ellipse([cx-16, cy-2, cx+16, cy+30], fill=(*highlights[num], 40))
            d.text((cx-5 if num<10 else cx-8, cy+4), str(num), font=load_font(13), fill=highlights[num])
        else:
            d.text((cx-5 if num<10 else cx-8, cy+4), str(num), font=load_font(12), fill=C_DARK)
    # Eventos del mes
    ey2 = dy2 + 5*44 + 20
    d.text((16, ey2), "Este mes", font=load_font(15,True), fill=C_DARK)
    evs2 = [("15 Jun","Control médico Sofía",C_GREEN),("18 Jun","Reunión colegio Tomás",C_PURPLE),("22 Jun","Entrega informe gastos",C_ORANGE)]
    for j,(fecha,ev,col) in enumerate(evs2):
        ry2 = ey2+28+j*56
        rounded_rect(d, 12, ry2, W-12, ry2+46, 10, fill=C_WHITE, outline=C_BORDER, width=1)
        d.rectangle([12,ry2,18,ry2+46], fill=col)
        d.text((24, ry2+6), fecha, font=load_font(10), fill=C_SUB)
        d.text((24, ry2+22), ev, font=load_font(13,True), fill=C_DARK)
    draw_navbar(img, d, 2)
    return img

# ── Screenshot 4: Gastos ─────────────────────────────────────────
def shot_expenses():
    img, d = new_screen()
    draw_statusbar(d)
    d.rectangle([0, 44, W, 108], fill=C_DARK)
    d.text((16, 58), "Gastos compartidos", font=load_font(18,True), fill=C_WHITE)
    d.text((16, 84), "Junio 2026", font=load_font(13), fill=(180,220,210))
    # Resumen
    rounded_rect(d, 12, 120, W-12, 204, 16, fill=C_DARK)
    d.text((24, 132), "Total del mes", font=load_font(12), fill=(180,220,210))
    d.text((24, 150), "$85.400", font=load_font(32,True), fill=C_GREEN)
    d.text((24, 188), "Mamá: $52.400  ·  Papá: $33.000", font=load_font(11), fill=(180,220,210))
    # Lista gastos
    gastos = [("Colegio","Tomás — mensualidad","$35.000","Educación",C_BLUE),
              ("Farmacia","Medicamentos Sofía","$12.400","Salud",C_GREEN),
              ("Útiles","Materiales escolares","$8.900","Educación",C_BLUE),
              ("Dentista","Control dental Sofía","$29.100","Salud",C_GREEN)]
    gy = 218
    d.text((16, gy), "Últimos gastos", font=load_font(14,True), fill=C_DARK)
    for cat,desc,amt,tag,col in gastos:
        gy += 32
        rounded_rect(d, 12, gy, W-12, gy+58, 12, fill=C_WHITE, outline=C_BORDER, width=1)
        d.rounded_rectangle([20,gy+10,52,gy+48], radius=10, fill=(*col,30))
        d.text((28, gy+20), cat[0], font=load_font(16,True), fill=col)
        d.text((62, gy+12), cat, font=load_font(13,True), fill=C_DARK)
        d.text((62, gy+32), desc, font=load_font(11), fill=C_SUB)
        aw = load_font(15,True).getbbox(amt)[2]
        d.text((W-aw-20, gy+20), amt, font=load_font(15,True), fill=C_DARK)
        gy += 58
    draw_navbar(img, d, 3)
    return img

# ── Guardar ──────────────────────────────────────────────────────
OUT = "/home/user/CoPadres/CoPadres_Entrega_Final"
shots = [
    ("screenshot_01_dashboard.png",  shot_dashboard),
    ("screenshot_02_chat.png",       shot_chat),
    ("screenshot_03_calendario.png", shot_calendar),
    ("screenshot_04_gastos.png",     shot_expenses),
]
for fname, fn in shots:
    img = fn()
    path = os.path.join(OUT, fname)
    img.save(path, "PNG", optimize=True)
    print(f"✅ {fname}  ({os.path.getsize(path):,} bytes)")
print("\nCapturas generadas.")
