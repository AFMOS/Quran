import os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DIR = os.path.join(ROOT, "public", "quran_chapters")
SCRIPT = '<script src="reader.js"></script>\n'

for fname in ["index.html", "search.html"] + [f"ch_{i:03d}.html" for i in range(1, 115)]:
    path = os.path.join(DIR, fname)
    if not os.path.exists(path):
        continue
    with open(path, "r", encoding="utf-8") as f:
        text = f.read()
    if "reader.js" in text:
        continue
    text = text.replace("</body>", SCRIPT + "</body>")
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)
    print(f"Added to {fname}")

print("Done.")
