"""Create SweetRoots QR marketing assets in the correct folders."""

from pathlib import Path

import qrcode
from PIL import Image, ImageDraw


SITE_URL = "https://roots-on-route-66.vercel.app"
QR_ROOT = Path(__file__).resolve().parents[1]

ASSETS = [
    ("posters", "01_classic_dark.png", "#061827", "#f97316", "#ffffff"),
    ("posters", "02_natural_fresh.png", "#fff7df", "#4f772d", "#263618"),
    ("posters", "03_earthy_organic.png", "#fff4d6", "#a0521d", "#4b2e16"),
    ("posters", "04_sunset_harvest.png", "#101827", "#f97316", "#ffffff"),
    ("stickers", "05_circle_sticker.png", "#ffffff", "#d95f02", "#223322"),
    ("social_media", "06_minimal_clean.png", "#ffffff", "#f97316", "#061827"),
    ("business_cards", "07_business_card_style.png", "#061827", "#f97316", "#ffffff"),
    ("plant_tags", "08_plant_tag_style.png", "#061827", "#f59e0b", "#ffffff"),
]


def make_qr(fill_color, back_color):
    """Create a scannable QR code that points to the SweetRoots website."""
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=14,
        border=3,
    )
    qr.add_data(SITE_URL)
    qr.make(fit=True)

    return qr.make_image(
        fill_color=fill_color,
        back_color=back_color,
    ).convert("RGBA")


def make_asset(folder, filename, background, accent, text_color):
    """Create one QR marketing asset in its assigned folder."""
    width, height = 900, 1200
    card = Image.new("RGBA", (width, height), background)
    draw = ImageDraw.Draw(card)

    qr_img = make_qr(text_color, "#ffffff").resize((620, 620))

    draw.rounded_rectangle(
        (40, 40, width - 40, height - 40),
        radius=55,
        outline=accent,
        width=8,
    )

    draw.text((width // 2, 130), "SweetRoots", fill=accent, anchor="mm")
    draw.text(
        (width // 2, 210),
        "GROW • TRACK • SHARE",
        fill=text_color,
        anchor="mm",
    )

    qr_x = (width - qr_img.width) // 2
    card.alpha_composite(qr_img, (qr_x, 290))

    draw.rounded_rectangle(
        (210, 960, width - 210, 1045),
        radius=42,
        fill=accent,
    )
    draw.text((width // 2, 1002), "SCAN TO VISIT", fill="#ffffff", anchor="mm")
    draw.text(
        (width // 2, 1110),
        SITE_URL.replace("https://", ""),
        fill=text_color,
        anchor="mm",
    )

    output_dir = QR_ROOT / folder
    output_dir.mkdir(parents=True, exist_ok=True)

    output_path = output_dir / filename
    card.convert("RGB").save(output_path, quality=95)


def main():
    """Generate all QR assets."""
    for folder, filename, background, accent, text_color in ASSETS:
        make_asset(folder, filename, background, accent, text_color)

    print(f"All QR assets point to: {SITE_URL}")


if __name__ == "__main__":
    main()
