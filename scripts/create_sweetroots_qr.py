"""Create SweetRoots QR code marketing images."""

from pathlib import Path

import qrcode
from PIL import Image, ImageDraw, ImageFont


URL = "https://roots-on-route-66.vercel.app"
OUT_DIR = Path("marketing")
OUT_DIR.mkdir(exist_ok=True)

TITLE_FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
BODY_FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"


def make_qr() -> Image.Image:
    """Return a high-quality QR image."""
    qr = qrcode.QRCode(
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=16,
        border=3,
    )
    qr.add_data(URL)
    qr.make(fit=True)

    image = qr.make_image(
        fill_color="#162033",
        back_color="#fff7cc",
    ).convert("RGBA")

    return image.resize((760, 760), Image.Resampling.NEAREST)


def draw_sweet_potato(draw: ImageDraw.ImageDraw, x: int, y: int) -> None:
    """Draw a simple sweet potato icon."""
    draw.ellipse((x, y + 18, x + 100, y + 88), fill="#f97316")
    draw.ellipse((x + 25, y + 34, x + 43, y + 52), fill="#fed7aa")
    draw.ellipse((x + 62, y + 56, x + 78, y + 72), fill="#fed7aa")
    draw.polygon(
        [(x + 88, y + 18), (x + 145, y - 18), (x + 118, y + 48)],
        fill="#22c55e",
    )


def create_marketing_qr() -> None:
    """Create customer-facing QR poster image."""
    canvas = Image.new("RGBA", (1080, 1350), "#162033")
    draw = ImageDraw.Draw(canvas)

    title_font = ImageFont.truetype(TITLE_FONT, 84)
    subtitle_font = ImageFont.truetype(BODY_FONT, 38)
    small_font = ImageFont.truetype(BODY_FONT, 30)
    label_font = ImageFont.truetype(TITLE_FONT, 42)

    draw.rounded_rectangle(
        (70, 60, 1010, 205),
        radius=46,
        fill="#1e2a40",
        outline="#f59e0b",
        width=3,
    )
    draw_sweet_potato(draw, 105, 78)
    draw.text((280, 82), "SweetRoots", font=title_font, fill="#f97316")

    subtitle = "Scan to explore sweet potato varieties"
    box = draw.textbbox((0, 0), subtitle, font=subtitle_font)
    draw.text(
        ((1080 - (box[2] - box[0])) // 2, 250),
        subtitle,
        font=subtitle_font,
        fill="#fff7cc",
    )

    draw.rounded_rectangle(
        (120, 330, 960, 1170),
        radius=52,
        fill="#fff7cc",
        outline="#f59e0b",
        width=8,
    )

    qr = make_qr()
    canvas.alpha_composite(qr, (160, 370))

    badge_x = 472
    badge_y = 682
    draw.rounded_rectangle(
        (badge_x, badge_y, badge_x + 136, badge_y + 136),
        radius=34,
        fill="#162033",
        outline="#f59e0b",
        width=5,
    )
    draw_sweet_potato(draw, badge_x + 20, badge_y + 30)

    footer = "roots-on-route-66.vercel.app"
    box = draw.textbbox((0, 0), footer, font=small_font)
    draw.text(
        ((1080 - (box[2] - box[0])) // 2, 1204),
        footer,
        font=small_font,
        fill="#fff7cc",
    )

    tagline = "Grow • Track • Share"
    box = draw.textbbox((0, 0), tagline, font=label_font)
    draw.text(
        ((1080 - (box[2] - box[0])) // 2, 1252),
        tagline,
        font=label_font,
        fill="#f97316",
    )

    canvas.convert("RGB").save(OUT_DIR / "sweetroots_customer_qr.png", quality=95)


def create_label_qr() -> None:
    """Create cleaner QR image for labels and business cards."""
    canvas = Image.new("RGBA", (900, 1050), "#fff7cc")
    draw = ImageDraw.Draw(canvas)

    title_font = ImageFont.truetype(TITLE_FONT, 80)
    small_font = ImageFont.truetype(BODY_FONT, 32)

    qr = make_qr()
    canvas.alpha_composite(qr, (70, 60))

    draw_sweet_potato(draw, 95, 850)
    draw.text((250, 845), "SweetRoots", font=title_font, fill="#f97316")
    draw.text(
        (95, 955),
        "Scan for sweet potato varieties",
        font=small_font,
        fill="#162033",
    )

    canvas.convert("RGB").save(OUT_DIR / "sweetroots_label_qr.png", quality=95)


def main() -> None:
    """Generate QR assets."""
    create_marketing_qr()
    create_label_qr()

    print("Created marketing/sweetroots_customer_qr.png")
    print("Created marketing/sweetroots_label_qr.png")


if __name__ == "__main__":
    main()
