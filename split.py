import os

os.makedirs('src/styles', exist_ok=True)

with open('src/index.css', 'r') as f:
    content = f.read()

# Instead of line numbers, we split by markers:
def extract_section(start_marker, end_marker, include_markers=True):
    start_idx = content.find(start_marker)
    if start_idx == -1: return ""
    
    if end_marker:
        end_idx = content.find(end_marker, start_idx + len(start_marker))
        if end_idx == -1: end_idx = len(content)
        res = content[start_idx:end_idx]
    else:
        res = content[start_idx:]
        
    return res.strip() + "\n"

# The original file is highly structured with `/* ====` headers and `@layer` blocks.
# Let's cleanly build the files block by block:

base_css = extract_section("@import url", "/* ========================================\n   Theme Transition Helper")
base_css += "\n@layer base {\n  * {\n" + extract_section("  * {\n    @apply border-border;", "  /* ========================================\n     Typography Hierarchy System").replace("@layer base {\n", "").replace("}\n\n  /* Typography", "  /* Typography")

animations_css = extract_section("/* ========================================\n   Theme Transition Helper", "@layer base {\n  * {\n")
animations_css += extract_section("  /* Logo band */", "/* ========================================\n   Services Section Premium Styles")
animations_css += extract_section("  /* Animation delay utilities */", "/* ============================================\n   Shiny Input Container (DreamInput)")
animations_css += extract_section("/* ============================================\n   Dual Carousel Animations", "/* ============================================\n   Performance Utilities")

typography_css = "@layer base {\n" + extract_section("  /* Typography scale */", "  /* Reduce motion for accessibility */")
typography_css += extract_section("  /* Reduce motion for accessibility */", "}\n\n@layer components {\n") + "}\n\n"
typography_css += "@layer components {\n" + extract_section("  /* TypeRig - Signature typography animation wrapper */", "  /* Depth layer base styles */")
typography_css += extract_section("  /* Editorial typography */", "  /* Scroll indicator */") + "}\n"

layout_css = "@layer components {\n" + extract_section("  /* Depth layer base styles */", "  /* Editorial typography */") + "}\n\n"
layout_css += "@layer utilities {\n" + extract_section("/* ============================================\n   Performance Utilities", "/* ========================================\n   Dashboard Header Slab") + "}\n"

components_css = "@layer components {\n" + extract_section("  /* Scroll indicator */", "  /* Logo band */")
components_css += extract_section("  /* Work grid card */", "}\n\n/* ========================================\n   Services Section") + "}\n\n"
components_css += extract_section("/* ========================================\n   Services Section Premium Styles", "@layer utilities {\n")
components_css += extract_section("/* ============================================\n   Shiny Input Container (DreamInput)", "/* ============================================\n   Dual Carousel Animations")
components_css += extract_section("/* ========================================\n   Dashboard Header Slab", "/* ========================================\n   Configurator Card Surface System")

configurator_css = extract_section("/* ========================================\n   Configurator Card Surface System", None)

with open('src/styles/base.css', 'w') as f: f.write(base_css)
with open('src/styles/animations.css', 'w') as f: f.write(animations_css)
with open('src/styles/typography.css', 'w') as f: f.write(typography_css)
with open('src/styles/layout.css', 'w') as f: f.write(layout_css)
with open('src/styles/components.css', 'w') as f: f.write(components_css)
with open('src/styles/configurator.css', 'w') as f: f.write(configurator_css)

with open('src/index.css', 'w') as f:
    f.write("""@import './styles/base.css';
@import './styles/typography.css';
@import './styles/layout.css';
@import './styles/components.css';
@import './styles/configurator.css';
@import './styles/animations.css';
""")
print("Done")
