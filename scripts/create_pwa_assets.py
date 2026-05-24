"""Create SweetRoots PWA icons and social preview assets."""

from pathlib import Path

import qrcode
from PIL import Image, ImageDraw, ImageFont


SITE_URL = "https://roots-on-route-66.vercel.app"
FRONTEND_DIR = Path("frontend")
ICONS_DIR = FRONTEND_DIR / "icons"


def load_font(size, bold=False):
    """Load a readable system font."""
    font_path = (
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
        if bold
        else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
    )
    return ImageFont.truetype(font_path, size)


def make_qr(size=360):
    """Create a visible QR code."""
    qr = qrcode.QRCode(
        version=6,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=12,
        border=3,
    )
    qr.add_data(SITE_URL)
    qr.make(fit=True)

    image = qr.make_image(
        fill_color="#0f172a",
        back_color="#fff7ed",
    ).convert("RGB")

    return image.resize((size, size))


def create_icon(size):
    """Create a PWA app icon."""
    image = Image.new("RGB", (size, size), "#0f172a")
    draw = ImageDraw.Draw(image)

    margin = int(size * 0.08)
    draw.rounded_rectangle(
        (margin, margin, size - margin, size - margin),
        radius=int(size * 0.18),
        fill="#111827",
        outline="#f97316",
        width=max(4, size // 40),
    )

    title_font = load_font(int(size * 0.28), bold=True)
    small_font = load_font(int(size * 0.09), bold=True)

    draw.text(
        (size // 2, int(size * 0.38)),
        "SR",
        fill="#f97316",
        font=title_font,
        anchor="mm",
    )
    draw.text(
        (size // 2, int(size * 0.62)),
        "SweetRoots",
        fill="#fff7ed",
        font=small_font,
        anchor="mm",
    )

    image.save(ICONS_DIR / f"icon-{size}.png", quality=95)


def create_og_image():
    """Create a readable landscape social sharing image."""
    width, height = 1200, 630

    image = Image.new("RGB", (width, height), "#0f172a")
    draw = ImageDraw.Draw(image)

    title_font = load_font(76, bold=True)
    subtitle_font = load_font(38)
    body_font = load_font(30)
    url_font = load_font(28, bold=True)

    draw.rounded_rectangle(
        (40, 40, width - 40, height - 40),
        radius=44,
        outline="#f97316",
        width=8,
    )

    draw.text(
        (95, 145),
        "SweetRoots",
        fill="#f97316",
        font=title_font,
        anchor="lm",
    )
    draw.text(
        (100, 235),
        "Grow • Track • Share",
        fill="#fff7ed",
        font=subtitle_font,
        anchor="lm",
    )
    draw.text(
        (100, 335),
        "Sweet potato lineage,\npropagation tracking,\nand community garden records.",
        fill="#cbd5e1",
        font=body_font,
        anchor="la",
        spacing=10,
    )
    draw.text(
        (100, 545),
        "roots-on-route-66.vercel.app",
        fill="#f97316",
        font=url_font,
        anchor="lm",
    )

    qr = make_qr(360)
    qr_x = 760
    qr_y = 135

    draw.rounded_rectangle(
        (qr_x - 25, qr_y - 25, qr_x + 385, qr_y + 385),
        radius=32,
        fill="#fff7ed",
        outline="#f97316",
        width=6,
    )
    image.paste(qr, (qr_x, qr_y))

    draw.rounded_rectangle(
        (820, 525, 1105, 575),
        radius=25,
        fill="#f97316",
    )
    draw.text(
        (962, 550),
        "SCAN TO VISIT",
        fill="#ffffff",
        font=url_font,
        anchor="mm",
    )

    image.save(FRONTEND_DIR / "og-image.png", quality=95)


def main():
    """Create all PWA and social image assets."""
    ICONS_DIR.mkdir(parents=True, exist_ok=True)

    for size in (192, 512):
        create_icon(size)

    create_og_image()

    print("Created PWA icons and og-image.png")


if __name__ == "__main__":
    main()
