import os
import shutil
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../uploads/products"))
os.makedirs(OUTPUT_DIR, exist_ok=True)

# First, copy the official sample garment
sample_src = os.path.abspath(os.path.join(os.path.dirname(__file__), "../fashn-vton-1.5/examples/data/garment.webp"))
if os.path.exists(sample_src):
    shutil.copyfile(sample_src, os.path.join(OUTPUT_DIR, "fashn-sample-top.webp"))

def create_garment_art(filename, bg_color, garment_type, primary_color, accent_color, label_text):
    width, height = 768, 1024
    img = Image.new("RGB", (width, height), bg_color)
    draw = ImageDraw.Draw(img)

    # Add gentle studio lighting gradient/vignette
    center_x, center_y = width // 2, height // 2
    for r in range(width // 2, 0, -10):
        alpha = int(15 * (1 - r / (width // 2)))
        draw.ellipse(
            [center_x - r, center_y - r * 1.3, center_x + r, center_y + r * 1.3],
            outline=(245, 245, 247),
            width=5,
        )

    if garment_type == "kurta":
        # Draw Kurta silhouette
        # Shoulders & Sleeves
        shoulder_pts = [
            (220, 240), (280, 200), (384, 215), (488, 200), (548, 240),
            (560, 480), (500, 490), (470, 360),
            (490, 780), (274, 780),
            (294, 360), (264, 490), (204, 480)
        ]
        draw.polygon(shoulder_pts, fill=primary_color)
        
        # Slit down the side
        draw.line([(280, 620), (280, 780)], fill=(30, 30, 30, 60), width=4)
        draw.line([(484, 620), (484, 780)], fill=(30, 30, 30, 60), width=4)
        
        # Placket and mandarin collar
        draw.rectangle([374, 215, 394, 420], fill=accent_color)
        for b_y in [260, 300, 340, 380]:
            draw.ellipse([380, b_y, 388, b_y + 8], fill=(220, 200, 140))
        
        # Gold/accent border embroidery on hem and cuffs
        draw.rectangle([274, 765, 490, 780], fill=accent_color)
        draw.rectangle([204, 470, 264, 485], fill=accent_color)
        draw.rectangle([500, 470, 560, 485], fill=accent_color)

    elif garment_type == "jacket":
        # Nehru Jacket
        jacket_pts = [
            (240, 230), (310, 190), (384, 205), (458, 190), (528, 230),
            (510, 600), (254, 600)
        ]
        draw.polygon(jacket_pts, fill=primary_color)
        # Mandarin collar
        draw.rectangle([334, 185, 434, 220], fill=accent_color)
        # Center placket & buttons
        draw.rectangle([376, 205, 392, 595], fill=accent_color)
        for b_y in range(240, 560, 45):
            draw.ellipse([380, b_y, 388, b_y + 8], fill=(212, 175, 55))
        # Pocket square
        draw.rectangle([430, 300, 480, 330], fill=(20, 20, 20, 40))
        draw.polygon([(445, 300), (455, 275), (465, 300)], fill=(240, 240, 245))

    elif garment_type == "shirt":
        # Formal / Mandarin shirt
        shirt_pts = [
            (230, 240), (300, 200), (384, 215), (468, 200), (538, 240),
            (555, 480), (495, 490), (470, 350),
            (485, 660), (279, 660),
            (294, 350), (269, 490), (209, 480)
        ]
        draw.polygon(shirt_pts, fill=primary_color)
        # Collar
        draw.polygon([(344, 205), (384, 240), (424, 205), (400, 195), (368, 195)], fill=accent_color)
        # Button band
        draw.rectangle([378, 240, 390, 650], fill=(230, 230, 235))
        for b_y in range(270, 620, 60):
            draw.ellipse([381, b_y, 387, b_y + 6], fill=(160, 160, 165))

    elif garment_type == "pants":
        # Trousers / Chinos
        waist_pts = [
            (300, 300), (468, 300),
            (480, 450), (445, 840), (395, 840),
            (384, 490),
            (373, 840), (323, 840),
            (288, 450)
        ]
        draw.polygon(waist_pts, fill=primary_color)
        # Belt line
        draw.rectangle([300, 300, 468, 325], fill=accent_color)
        draw.rectangle([374, 303, 394, 322], fill=(200, 200, 200)) # Buckle
        # Pleats / crease lines
        draw.line([(348, 350), (348, 830)], fill=(20, 20, 20, 30), width=2)
        draw.line([(420, 350), (420, 830)], fill=(20, 20, 20, 30), width=2)

    elif garment_type == "dress":
        # Anarkali / Gown
        gown_pts = [
            (270, 230), (330, 195), (384, 210), (438, 195), (498, 230),
            (520, 420), (475, 430), (450, 340),
            (440, 410), (560, 860), (208, 860), (328, 410),
            (318, 340), (293, 430), (248, 420)
        ]
        draw.polygon(gown_pts, fill=primary_color)
        # Empire waist band
        draw.rectangle([328, 400, 440, 420], fill=accent_color)
        # Gold hem embroidery
        draw.rectangle([208, 825, 560, 860], fill=accent_color)
        draw.ellipse([354, 200, 414, 250], fill=bg_color) # Neckline
        draw.line([(384, 250), (384, 400)], fill=accent_color, width=4)

    # Minimal label banner at bottom
    draw.rectangle([40, 930, 728, 990], fill=(255, 255, 255, 240))
    draw.text((60, 948), label_text.upper(), fill=(40, 40, 45))

    out_path = os.path.join(OUTPUT_DIR, filename)
    img.save(out_path, format="WEBP", quality=92)
    print(f"Generated product image: {out_path}")

products_to_generate = [
    ("emerald-kurta.webp", (248, 249, 250), "kurta", (14, 88, 56), (218, 165, 32), "Emerald Silk Kurta • Heritage Collection"),
    ("saffron-kurta.webp", (250, 250, 250), "kurta", (230, 130, 20), (180, 50, 10), "Saffron Cotton Kurta • Summer Blend"),
    ("midnight-kurta.webp", (246, 247, 249), "kurta", (18, 30, 66), (192, 192, 210), "Midnight Blue Kurta • Regal Embroidery"),
    ("maroon-jacket.webp", (248, 247, 245), "jacket", (110, 20, 35), (200, 160, 60), "Maroon Jacquard Nehru Jacket • Festive"),
    ("ivory-shirt.webp", (245, 246, 248), "shirt", (238, 235, 225), (190, 185, 170), "Ivory Mandarin Linen Shirt • Smart Casual"),
    ("charcoal-trousers.webp", (248, 248, 250), "pants", (45, 48, 55), (30, 32, 38), "Charcoal Slim Chinos • Tailored Fit"),
    ("beige-linen-pants.webp", (250, 249, 246), "pants", (215, 200, 175), (170, 155, 130), "Beige Pure Linen Trousers • Breathable"),
    ("indigo-denim.webp", (246, 247, 250), "pants", (30, 55, 105), (20, 35, 70), "Deep Indigo Selvedge Jeans • Classic"),
    ("crimson-anarkali.webp", (250, 246, 246), "dress", (160, 20, 45), (220, 180, 55), "Crimson Anarkali Gown • Gold Zari Trim"),
    ("olive-jumpsuit.webp", (247, 249, 246), "dress", (70, 90, 65), (45, 60, 40), "Olive Indo-Western Jumpsuit • Contemporary"),
]

for item in products_to_generate:
    create_garment_art(*item)

print("All sample products generated successfully.")
