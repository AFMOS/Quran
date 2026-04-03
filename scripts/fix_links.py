import os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DIR = os.path.join(ROOT, "public", "quran_chapters")

# 1. Move index into quran_chapters and fix its links to use filenames only
index_src = os.path.join(ROOT, "index.html")
index_dst = os.path.join(DIR, "index.html")
if os.path.exists(index_src):
    with open(index_src, "r", encoding="utf-8") as f:
        text = f.read()
    for ch in range(114, 0, -1):
        text = text.replace(f"quran_chapters/ch_{ch:03d}.html", f"ch_{ch:03d}.html")
    with open(index_dst, "w", encoding="utf-8") as f:
        f.write(text)
    os.remove(index_src)
    print("Index moved to quran_chapters/")

# 2. Fix each chapter: Index, Previous, Next links (replace high numbers first)
for ch in range(1, 115):
    path = os.path.join(DIR, f"ch_{ch:03d}.html")
    with open(path, "r", encoding="utf-8") as f:
        text = f.read()
    text = text.replace("http://holyquran.net/quran/index.html", "index.html")
    for n in range(114, 0, -1):
        text = text.replace(f"http://holyquran.net/cgi-bin/prepare.pl?ch={n}", f"ch_{n:03d}.html")
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)
    print(f"Fixed ch_{ch:03d}.html")

print("Done.")
