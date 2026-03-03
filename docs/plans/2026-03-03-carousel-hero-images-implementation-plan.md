# Carousel Images Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Process three UI fragment images into 1200x1600 (3:4) carousel assets featuring a blurred oversized background and a crisp foreground with padding.

**Architecture:** A lightweight Python script utilizing the `Pillow` (PIL) library to automatically composite the background and foreground layers cleanly.

**Tech Stack:** Python 3, Pillow (`pip install Pillow`)

---

### Task 1: Create Image Processing Script

**Files:**
- Create: `scripts/process_carousel_images.py`

**Step 1: Write the Image Processor Script**

This script will read the source images, create the blurred background, composite the crisp foreground, and save them.

```python
import os
from PIL import Image, ImageFilter, ImageDraw

def process_image(input_path, output_path, canvas_size=(1200, 1600), blur_radius=50, padding=120):
    try:
        with Image.open(input_path) as img:
            img = img.convert("RGBA")
            
            # --- 1. Create Background ---
            img_ratio = img.width / img.height
            canvas_ratio = canvas_size[0] / canvas_size[1]
            
            if img_ratio > canvas_ratio:
                new_h = canvas_size[1]
                new_w = int(new_h * img_ratio)
            else:
                new_w = canvas_size[0]
                new_h = int(new_w / img_ratio)
                
            bg_resize = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
            
            left = (new_w - canvas_size[0]) / 2
            top = (new_h - canvas_size[1]) / 2
            right = (new_w + canvas_size[0]) / 2
            bottom = (new_h + canvas_size[1]) / 2
            bg_crop = bg_resize.crop((int(left), int(top), int(right), int(bottom)))
            
            bg_blur = bg_crop.filter(ImageFilter.GaussianBlur(blur_radius))
            
            dark_overlay = Image.new("RGBA", canvas_size, (0, 0, 0, 128))
            background = Image.alpha_composite(bg_blur, dark_overlay)
            
            # --- 2. Create Foreground ---
            max_fg_width = canvas_size[0] - (padding * 2)
            max_fg_height = canvas_size[1] - (padding * 2)
            
            fg_ratio = img.width / img.height
            if fg_ratio > (max_fg_width / max_fg_height):
                fg_w = max_fg_width
                fg_h = int(fg_w / fg_ratio)
            else:
                fg_h = max_fg_height
                fg_w = int(fg_h * fg_ratio)
                
            foreground = img.resize((fg_w, fg_h), Image.Resampling.LANCZOS)
            
            # Draw subtle border
            fg_with_border = Image.new("RGBA", (fg_w, fg_h))
            fg_with_border.paste(foreground, (0, 0))
            draw = ImageDraw.Draw(fg_with_border)
            draw.rectangle([0, 0, fg_w - 1, fg_h - 1], outline=(255, 255, 255, 30), width=1)
            
            # Draw drop shadow
            shadow_offset = 20
            shadow_size = (fg_w + shadow_offset, fg_h + shadow_offset)
            shadow_layer = Image.new("RGBA", shadow_size, (0,0,0,0))
            shadow_draw = ImageDraw.Draw(shadow_layer)
            shadow_draw.rectangle([0, 0, fg_w, fg_h], fill=(0,0,0,150))
            shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(25))
            
            # --- 3. Composite ---
            final_image = background.copy()
            
            fg_x = (canvas_size[0] - fg_w) // 2
            fg_y = (canvas_size[1] - fg_h) // 2
            
            final_image.paste(shadow_layer, (fg_x - shadow_offset, fg_y), mask=shadow_layer)
            final_image.paste(fg_with_border, (fg_x, fg_y), mask=fg_with_border)
            
            final_image.convert("RGB").save(output_path, "JPEG", quality=90)
            print(f"Processed: {output_path}")

    except Exception as e:
        print(f"Error processing {input_path}: {e}")

if __name__ == "__main__":
    assets_dir = "src/assets/carousel-images"
    target_files = [
        "hero_creator_v3_1772506437184.png",
        "hero_creator_v1_1772506343751.png",
        "hero_consultant_v1_1772506298532.png"
    ]
        
    for filename in target_files:
        in_path = os.path.join(assets_dir, filename)
        out_path = os.path.join(assets_dir, filename.replace(".png", "_optimized.jpg"))
        
        if os.path.exists(in_path):
            process_image(in_path, out_path)
            
    print("Optimization complete.")
```

**Step 2: Create scripts directory and install dependencies**

Run: `mkdir -p scripts && pip3 install Pillow`

**Step 3: Run the Script**

Run: `python3 scripts/process_carousel_images.py`

**Step 4: Verify Output**

Check `src/assets/carousel-images/` for the `_optimized.jpg` files visually to ensure they match the blurred-glass seamless border approach.

---

### Task 2: Hook up Optimized Images to Data Array

**Files:**
- Modify: `src/data/testimonials.ts:16-66`

**Step 1: Update Testimonial Data**

Update the `image` property in the `capabilityShowcase` array to point to the new `_optimized.jpg` variants across the six nodes.

**Step 2: Commit**

```bash
git add docs/plans/ scripts/process_carousel_images.py src/assets/carousel-images/*_optimized.jpg src/data/testimonials.ts
git commit -m "feat(carousel): optimize and integrate hyper-realistic hero images"
```
