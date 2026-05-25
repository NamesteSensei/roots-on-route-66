"""Create 8 SweetRoots QR marketing assets.

Each QR links to the live SweetRoots site:
https://roots-on-route-66.vercel.app
"""

from pathlib import Path

import qrcode
from PIL import Image, ImageDraw, ImageFont


URL = "https://roots-on-route-66.vercel.app"
OUT_DIR = Path("marketing/qr_pack")
OUT_DIR.mkdir(parents=True, exist_ok=True)

FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_REGULAR = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"


def make_qr(fill: str, back: str, size: int = 520) -> Image.Image:
    """Create a scannable QR image."""
    qr = qrcode.QRCode(
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=12,
        border=2,
    )
    qr.add_data(URL)
    qr.make(fit=True)

    image = qr.make_image(fill_color=fill, back_color=back).convert("RGBA")
    return image.resize((size, size), Image.Resampling.NEAREST)


def draw_potato(draw: ImageDraw.ImageDraw, x: int, y: int, scale: float = 1) -> None:
    """Draw a small sweet potato icon."""
    w = int(90 * scale)
    h = int(62 * scale)

    draw.ellipse((x, y, x + w, y + h), fill="#f97316", outline="#7c2d12", width=2)
    draw.ellipse((x + int(24 * scale), y + int(18 * scale),
                  x + int(38 * scale), y + int(32 * scale)), fill="#fed7aa")
    draw.ellipse((x + int(56 * scale), y + int(36 * scale),
                  x + int(68 * scale), y + int(48 * scale)), fill="#fed7aa")
    draw.polygon(
        [
            (x + int(74 * scale), y + int(8 * scale)),
            (x + int(126 * scale), y - int(24 * scale)),
            (x + int(106 * scale), y + int(34 * scale)),
        ],
        fill="#22c55e",
    )


def center_text(
    draw: ImageDraw.ImageDraw,
    text: str,
    y: int,
    font: ImageFont.FreeTypeFont,
    fill: str,
    width: int,
) -> None:
    """Draw centered text."""
    box = draw.textbbox((0, 0), text, font=font)
    x = (width - (box[2] - box[0])) // 2
    draw.text((x, y), text, font=font, fill=fill)


def add_center_badge(canvas: Image.Image, draw: ImageDraw.ImageDraw, cx: int, cy: int) -> None:
    """Add sweet potato badge to center of QR."""
    draw.ellipse((cx - 58, cy - 58, cx + 58, cy + 58), fill="#fff7cc", outline="#f97316", width=4)
    draw_potato(draw, cx - 42, cy - 22, 0.78)


def classic_dark() -> None:
    """Create classic dark QR poster."""
    w, h = 700, 980
    img = Image.new("RGBA", (w, h), "#071826")
    draw = ImageDraw.Draw(img)
    title = ImageFont.truetype(FONT_BOLD, 58)
    body = ImageFont.truetype(FONT_BOLD, 25)
    small = ImageFont.truetype(FONT_REGULAR, 23)

    draw.rounded_rectangle((25, 25, w - 25, h - 25), radius=28, outline="#f97316", width=6)
    draw_potato(draw, 58, 70, 0.8)
    draw.text((180, 75), "SweetRoots", font=title, fill="#f97316")
    center_text(draw, "GROW • TRACK • SHARE", 155, body, "#fff7cc", w)

    qr = make_qr("#071826", "#fff7cc")
    img.alpha_composite(qr, ((w - 520) // 2, 260))
    add_center_badge(img, draw, w // 2, 520)

    draw.rounded_rectangle((170, 820, 530, 882), radius=24, fill="#f97316")
    center_text(draw, "SCAN TO VISIT", 834, body, "white", w)
    center_text(draw, "🌐 roots-on-route-66.vercel.app", 910, small, "white", w)

    img.convert("RGB").save(OUT_DIR / "01_classic_dark.png", quality=95)


def natural_fresh() -> None:
    """Create natural fresh QR poster."""
    w, h = 700, 980
    img = Image.new("RGBA", (w, h), "#fff7cc")
    draw = ImageDraw.Draw(img)
    title = ImageFont.truetype(FONT_BOLD, 64)
    body = ImageFont.truetype(FONT_BOLD, 25)
    small = ImageFont.truetype(FONT_REGULAR, 23)

    draw.rounded_rectangle((25, 25, w - 25, h - 25), radius=28, outline="#2f4f26", width=4)
    draw_potato(draw, 290, 45, 0.9)
    center_text(draw, "SweetRoots", 140, title, "#2f4f26", w)
    center_text(draw, "GROW • TRACK • SHARE", 230, body, "#f97316", w)

    for x in (70, 590):
        draw.line((x, 360, x, 750), fill="#2f4f26", width=4)
        for y in range(375, 720, 65):
            draw.ellipse((x - 34, y, x, y + 42), fill="#84cc16")
            draw.ellipse((x, y + 12, x + 34, y + 54), fill="#84cc16")

    qr = make_qr("#3f6212", "#fff7cc")
    img.alpha_composite(qr, ((w - 520) // 2, 315))
    add_center_badge(img, draw, w // 2, 575)

    draw.polygon([(190, 830), (510, 830), (470, 890), (230, 890)], fill="#3f6212")
    center_text(draw, "SCAN TO EXPLORE", 844, body, "white", w)
    center_text(draw, "🌐 roots-on-route-66.vercel.app", 920, small, "#2f4f26", w)

    img.convert("RGB").save(OUT_DIR / "02_natural_fresh.png", quality=95)


def earthy_organic() -> None:
    """Create earthy organic QR poster."""
    w, h = 700, 980
    img = Image.new("RGBA", (w, h), "#fff4d6")
    draw = ImageDraw.Draw(img)
    title = ImageFont.truetype(FONT_BOLD, 58)
    body = ImageFont.truetype(FONT_BOLD, 25)
    italic = ImageFont.truetype(FONT_REGULAR, 28)
    small = ImageFont.truetype(FONT_REGULAR, 22)

    draw.rounded_rectangle((25, 25, w - 25, h - 25), radius=28, outline="#f59e0b", width=5)
    center_text(draw, "SweetRoots", 70, title, "#5b3418", w)
    center_text(draw, "GROW • TRACK • SHARE", 150, body, "#2f4f26", w)

    qr = make_qr("#9a4f18", "#fff7cc")
    img.alpha_composite(qr, ((w - 520) // 2, 245))
    add_center_badge(img, draw, w // 2, 505)

    draw.rectangle((25, 760, w - 25, h - 25), fill="#5b3418")
    center_text(draw, "From roots to harvest,", 790, italic, "white", w)
    center_text(draw, "we grow together.", 830, italic, "white", w)
    center_text(draw, "🌐 roots-on-route-66.vercel.app", 910, small, "white", w)

    img.convert("RGB").save(OUT_DIR / "03_earthy_organic.png", quality=95)


def sunset_harvest() -> None:
    """Create sunset harvest QR poster."""
    w, h = 700, 980
    img = Image.new("RGBA", (w, h), "#111827")
    draw = ImageDraw.Draw(img)
    title = ImageFont.truetype(FONT_BOLD, 58)
    body = ImageFont.truetype(FONT_BOLD, 25)
    small = ImageFont.truetype(FONT_REGULAR, 22)

    draw.rounded_rectangle((25, 25, w - 25, h - 25), radius=28, outline="#f97316", width=6)
    center_text(draw, "SweetRoots", 70, title, "#f97316", w)
    center_text(draw, "GROW • TRACK • SHARE", 150, body, "white", w)

    for i in range(200, 760):
        shade = int(20 + (i - 200) * 0.12)
        draw.line((30, i, w - 30, i), fill=(shade, max(25, shade // 2), 20, 255))
    draw.ellipse((95, 500, 190, 595), fill="#fbbf24")

    for x in range(60, 650, 80):
        draw.line((x, 760, w // 2, 500), fill="#7c2d12", width=3)

    qr = make_qr("#071826", "#fff7cc")
    img.alpha_composite(qr, ((w - 520) // 2, 260))
    add_center_badge(img, draw, w // 2, 520)

    draw.rounded_rectangle((170, 820, 530, 882), radius=24, fill="#f97316")
    center_text(draw, "SCAN TO VISIT", 834, body, "white", w)
    center_text(draw, "🌐 roots-on-route-66.vercel.app", 910, small, "white", w)

    img.convert("RGB").save(OUT_DIR / "04_sunset_harvest.png", quality=95)


def circle_sticker() -> None:
    """Create circle sticker QR."""
    size = 900
    img = Image.new("RGBA", (size, size), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    title = ImageFont.truetype(FONT_BOLD, 48)
    small = ImageFont.truetype(FONT_BOLD, 34)

    draw.ellipse((35, 35, size - 35, size - 35), fill="white", outline="#f97316", width=6)
    center_text(draw, "SWEETROOTS", 105, title, "#c2410c", size)

    qr = make_qr("#071826", "white", 500)
    img.alpha_composite(qr, ((size - 500) // 2, 220))
    add_center_badge(img, draw, size // 2, 470)

    center_text(draw, "GROW • TRACK • SHARE", 735, small, "#2f4f26", size)
    center_text(draw, "roots-on-route-66.vercel.app", 820, ImageFont.truetype(FONT_REGULAR, 28), "#071826", size)

    img.save(OUT_DIR / "05_circle_sticker.png")


def minimal_clean() -> None:
    """Create minimal clean QR card."""
    w, h = 700, 980
    img = Image.new("RGBA", (w, h), "white")
    draw = ImageDraw.Draw(img)
    title = ImageFont.truetype(FONT_BOLD, 58)
    body = ImageFont.truetype(FONT_BOLD, 25)
    small = ImageFont.truetype(FONT_REGULAR, 23)

    draw.rounded_rectangle((45, 35, w - 45, h - 35), radius=38, outline="#071826", width=4)

    qr = make_qr("#071826", "white")
    img.alpha_composite(qr, ((w - 520) // 2, 90))
    add_center_badge(img, draw, w // 2, 350)

    center_text(draw, "SweetRoots", 690, title, "#c2410c", w)
    center_text(draw, "GROW • TRACK • SHARE", 775, body, "#2f4f26", w)
    draw.line((180, 835, 520, 835), fill="#f97316", width=5)
    center_text(draw, "🌐 roots-on-route-66.vercel.app", 880, small, "#071826", w)

    img.convert("RGB").save(OUT_DIR / "06_minimal_clean.png", quality=95)


def business_card() -> None:
    """Create business-card style QR image."""
    w, h = 1100, 620
    img = Image.new("RGBA", (w, h), "white")
    draw = ImageDraw.Draw(img)
    title = ImageFont.truetype(FONT_BOLD, 62)
    body = ImageFont.truetype(FONT_BOLD, 25)
    small = ImageFont.truetype(FONT_REGULAR, 23)

    draw.rounded_rectangle((30, 30, w - 30, h - 30), radius=38, outline="#071826", width=4)
    draw.rounded_rectangle((30, 30, 560, h - 30), radius=38, fill="#071826")

    draw_potato(draw, 160, 130, 1.1)
    draw.text((120, 270), "SweetRoots", font=title, fill="#f97316")
    draw.text((125, 355), "GROW • TRACK • SHARE", font=body, fill="white")
    draw.line((125, 420, 440, 420), fill="#f97316", width=5)
    draw.text((125, 470), "🌐 roots-on-route-66.vercel.app", font=small, fill="white")

    qr = make_qr("#071826", "white", 430)
    img.alpha_composite(qr, (625, 95))
    add_center_badge(img, draw, 840, 310)

    img.convert("RGB").save(OUT_DIR / "07_business_card_style.png", quality=95)


def plant_tag() -> None:
    """Create plant tag style QR."""
    size = 900
    img = Image.new("RGBA", (size, size), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    title = ImageFont.truetype(FONT_BOLD, 56)
    body = ImageFont.truetype(FONT_BOLD, 26)
    small = ImageFont.truetype(FONT_REGULAR, 20)

    draw.ellipse((50, 50, size - 50, size - 50), fill="#071826", outline="#f97316", width=4)
    draw.ellipse((410, 75, 490, 155), fill="#fff7cc")
    center_text(draw, "SweetRoots", 185, title, "#f97316", size)

    qr = make_qr("#071826", "#f6a33a", 470)
    img.alpha_composite(qr, ((size - 470) // 2, 285))
    add_center_badge(img, draw, size // 2, 520)

    center_text(draw, "SCAN TO EXPLORE", 780, body, "white", size)
    center_text(draw, "roots-on-route-66.vercel.app", 825, small, "white", size)

    img.save(OUT_DIR / "08_plant_tag_style.png")


def main() -> None:
    """Create all QR marketing assets."""
    classic_dark()
    natural_fresh()
    earthy_organic()
    sunset_harvest()
    circle_sticker()
    minimal_clean()
    business_card()
    plant_tag()

    print("Created 8 QR files in marketing/qr_pack")


if __name__ == "__main__":
    main()
