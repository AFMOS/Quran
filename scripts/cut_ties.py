import os
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DIR = os.path.join(ROOT, "public", "quran_chapters")

# Inline styles to replace external CSS
STYLE_BLOCK = """<style>
.button{font-family:inherit;font-size:18px;cursor:pointer;border:1px solid #ccc;border-radius:6px;padding:8px 16px}
.button1{background:#4aa0d3;color:#fff;border-color:#4aa0d3}
.button1:hover{background:#0DC895;border-color:#0DC895}
.button2{background:#0DC895;color:#fff;border-color:#0DC895}
</style>"""

def process_file(path):
    with open(path, "r", encoding="utf-8") as f:
        text = f.read()
    
    # Remove Google Analytics / gtag
    text = re.sub(r'<!-- The new google analytics[^>]*-->.*?gtag\([\'"]config[\'"].*?\);?\s*</script>', '', text, flags=re.DOTALL)
    text = re.sub(r'<script async src="https://www\.googletagmanager\.com/gtag/js[^"]*"></script>\s*', '', text)
    text = re.sub(r'<script>\s*window\.dataLayer[^<]*</script>\s*', '', text, flags=re.DOTALL)
    
    # Remove Google Analytics (old ga)
    text = re.sub(r'<script>\s*\(function\(i,s,o,g,r,a,m\)\{[^<]*ga\([\'"]create[\'"].*?</script>\s*', '', text, flags=re.DOTALL)
    
    # Remove Google Ads - ad-only divs (top)
    text = re.sub(r'<div align="center">\s*<script async src="[^"]*pagead2[^"]*"></script>\s*<!-- HQ html\.lib[^>]*-->\s*</div>\s*', '', text)
    # Ad-only divs (bottom)
    text = re.sub(r'<div align="center">\s*<script async src="[^"]*pagead2[^"]*"></script>\s*<!-- HQ html\.lib bottom[^>]*-->\s*</div>\s*', '', text)
    # Orphan script/comment
    text = re.sub(r'<script async src="[^"]*pagead2[^"]*"></script>\s*', '', text)
    text = re.sub(r'<!-- HQ html\.lib[^>]*-->\s*', '', text)
    text = re.sub(r'<!-- quran index -->\s*', '', text)
    text = re.sub(r'<ins class="adsbygoogle"[^>]*>.*?</ins>\s*', '', text, flags=re.DOTALL)
    text = re.sub(r'<script>\s*\(adsbygoogle[^<]*</script>\s*', '', text, flags=re.DOTALL)
    
    # Remove favicon
    text = re.sub(r'<link rel="icon"[^>]*>\s*', '', text)
    
    # Replace external CSS with inline (only if we removed a stylesheet)
    if '../newhq.css' in text or 'stylesheet' in text.lower():
        text = re.sub(r'<LINK REL="stylesheet" HREF="[^"]*"[^>]*>\s*', '', text, flags=re.IGNORECASE)
        text = re.sub(r'<link rel="stylesheet"[^>]*href="[^"]*"[^>]*>\s*', '', text, flags=re.IGNORECASE)
        if STYLE_BLOCK not in text:
            text = text.replace('</head>', STYLE_BLOCK + '\n</head>', 1)
    
    # Replace arrow images with Unicode
    text = text.replace('<img src="../images/backward.png">', '‹')
    text = text.replace('<img src="../images/forward.png">', '›')
    
    # Remove background image ref (index)
    text = text.replace('background="../images/bgquran.gif" ', '')
    
    # Remove quranindex image (index) - replace with placeholder
    text = re.sub(r'<img src="../images/quranindex\.png">', '<span style="font-size:24px;color:#fff">القرآن الكريم</span>', text)
    
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)

# Process all HTML files
for fname in ["index.html", "search.html"] + [f"ch_{i:03d}.html" for i in range(1, 115)]:
    path = os.path.join(DIR, fname)
    if os.path.exists(path):
        process_file(path)
        print(f"Processed {fname}")

print("Done.")
