"""Disegna l'icona dell'app e ne scrive le misure in public/icone/.

Il pallone di public/favicon.svg sale dall'angolo in alto a destra, come un
sole al tramonto; a sinistra «FANTA» sopra il monogramma «SJ» di SouthJam.

Uso:  python scripts/icone.py
Serve Pillow e l'Impact di Windows (impact.ttf), il più vicino all'Anton del sito.
"""
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

USCITA = Path(__file__).resolve().parent.parent / "public" / "icone"
CARATTERE = "C:/Windows/Fonts/impact.ttf"

FONDO = (12, 10, 9)          # --background del tema scuro
ARANCIO = (255, 90, 31)      # --amantea-orange
CUCITURE = (18, 16, 18)      # --court-black
CHIARO = (247, 241, 230)     # --foreground del tema scuro

LATO = 2048                  # si disegna in grande, poi si riduce


def fondo():
    """Nero caldo con il bagliore arancio che sale dal basso, come nell'anteprima del sito."""
    piccolo = 256
    velo = Image.new("L", (piccolo, piccolo))
    px = velo.load()
    for y in range(piccolo):
        for x in range(piccolo):
            d = math.hypot(x / piccolo - 0.5, y / piccolo - 1.15)
            px[x, y] = round(255 * 0.42 * max(0.0, 1 - d / 0.8) ** 1.5)
    velo = velo.resize((LATO, LATO), Image.BICUBIC)
    return Image.composite(Image.new("RGB", (LATO, LATO), ARANCIO),
                           Image.new("RGB", (LATO, LATO), FONDO), velo)


def curva(p0, p1, p2, p3, passi=48):
    punti = []
    for i in range(passi + 1):
        t = i / passi
        u = 1 - t
        punti.append(tuple(u**3 * a + 3 * u * u * t * b + 3 * u * t * t * c + t**3 * d
                           for a, b, c, d in zip(p0, p1, p2, p3)))
    return punti


def pallone(img, cx, cy, raggio, giro=-18):
    """Il pallone del favicon, ruotato di qualche grado perché non sembri un mirino."""
    u = raggio / 18                      # un'unità del viewBox 40x40 di favicon.svg
    cos, sen = math.cos(math.radians(giro)), math.sin(math.radians(giro))

    def p(x, y):
        x, y = (x - 20) * u, (y - 20) * u
        return (cx + x * cos - y * sen, cy + x * sen + y * cos)

    cerchio = (cx - raggio, cy - raggio, cx + raggio, cy + raggio)
    ImageDraw.Draw(img).ellipse(cerchio, fill=ARANCIO)

    # le cuciture, disegnate a parte e ritagliate sul pallone
    segni = Image.new("L", img.size, 0)
    d = ImageDraw.Draw(segni)
    mezzo = 0.8 * u

    def tratto(punti):
        # tanti dischi lungo il percorso: nessuna sbavatura alle giunture
        for (x0, y0), (x1, y1) in zip(punti, punti[1:]):
            passi = max(1, int(math.hypot(x1 - x0, y1 - y0) / (mezzo / 4)))
            for i in range(passi + 1):
                x, y = x0 + (x1 - x0) * i / passi, y0 + (y1 - y0) * i / passi
                d.ellipse((x - mezzo, y - mezzo, x + mezzo, y + mezzo), fill=255)

    tratto([p(20, 1), p(20, 39)])
    tratto([p(1, 20), p(39, 20)])
    for s in (1, -1):                    # la curva di sinistra e la sua speculare
        def q(x, y):
            return p(20 + s * (x - 20), y)
        tratto(curva(q(5.2, 7.4), q(11, 12.5), q(13.5, 17), q(13.5, 20))
               + curva(q(13.5, 20), q(13.5, 23), q(11, 27.5), q(5.2, 32.6)))
    sagoma = Image.new("L", img.size, 0)
    ImageDraw.Draw(sagoma).ellipse(cerchio, fill=255)
    segni = Image.composite(segni, Image.new("L", img.size, 0), sagoma)
    img.paste(CUCITURE, (0, 0), segni)


def scritta(d, testo, x, y_base, altezza, colore, spazio=0.0, bordo=0):
    """Scrive `testo` con le maiuscole alte `altezza`, appoggiato su y_base; rende la x finale."""
    car = ImageFont.truetype(CARATTERE, 100)
    alto = car.getbbox("H")[3] - car.getbbox("H")[1]
    car = ImageFont.truetype(CARATTERE, round(100 * altezza / alto))
    inizio = x
    for passata in ((bordo,) if bordo else ()) + (0,):   # prima tutti i bordi, poi le lettere
        x = inizio
        for lettera in testo:
            d.text((x, y_base), lettera, font=car, fill=colore if not passata else FONDO,
                   anchor="ls", stroke_width=passata, stroke_fill=FONDO)
            x += car.getlength(lettera) + spazio * altezza
    return x


def icona(scala=1.0):
    """scala < 1 stringe il disegno verso il centro (per le icone ritagliabili)."""
    img = fondo()

    def f(v):                            # da frazione del lato a pixel, attorno al centro
        return LATO / 2 + (v - 0.5) * LATO * scala

    pallone(img, f(0.80), f(0.215), 0.30 * LATO * scala)
    d = ImageDraw.Draw(img)
    bordo = round(0.02 * LATO * scala)
    sinistra = f(0.115)
    destra = scritta(d, "SJ", sinistra, f(0.89), 0.40 * LATO * scala, CHIARO,
                     spazio=0.03, bordo=bordo) - 0.03 * 0.40 * LATO * scala
    # «FANTA» nello stesso chiaro, largo quanto «SJ»: si legge anche in piccolo
    prova = ImageDraw.Draw(Image.new("L", (LATO * 2, 8)))
    larga = scritta(prova, "FANTA", 0, 0, 100, 255, spazio=0.05) - 5
    alta = 100 * (destra - sinistra) / larga
    scritta(d, "FANTA", sinistra, f(0.44), alta, CHIARO, spazio=0.05, bordo=bordo)
    return img


def salva(img, nome, lato):
    USCITA.mkdir(parents=True, exist_ok=True)
    img.resize((lato, lato), Image.LANCZOS).save(USCITA / nome, optimize=True)
    print(nome, lato)


def main():
    piena = icona()                      # a tutto campo: il telefono arrotonda da sé
    ritaglio = icona(scala=0.78)         # il disegno resta nella zona sicura di Android
    salva(piena, "apple-touch-icon.png", 180)
    salva(piena, "icona-192.png", 192)
    salva(piena, "icona-512.png", 512)
    salva(ritaglio, "icona-ritagliabile-512.png", 512)


if __name__ == "__main__":
    main()
