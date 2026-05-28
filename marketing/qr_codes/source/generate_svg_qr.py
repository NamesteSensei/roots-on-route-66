"""Generate the real SweetRoots SVG QR code."""

from pathlib import Path

import qrcode
import qrcode.image.svg


QR_URL = "https://roots-on-route-66.vercel.app/qr/share/"
OUTPUT_PATH = (
    Path(__file__).resolve().parents[1]
    / "generated"
    / "sweetroots_qr.svg"
)


def main():
    """Create the SVG QR code."""
    factory = qrcode.image.svg.SvgPathImage
    image = qrcode.make(QR_URL, image_factory=factory)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    image.save(OUTPUT_PATH)

    print(f"Created SVG QR: {OUTPUT_PATH}")
    print(f"QR points to: {QR_URL}")


if __name__ == "__main__":
    main()
