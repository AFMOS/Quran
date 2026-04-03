import os
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DIR = os.path.join(ROOT, "public", "quran_chapters")

# Extract verse counts from each chapter
counts = {}
for i in range(1, 115):
    path = os.path.join(DIR, f"ch_{i:03d}.html")
    with open(path, "r", encoding="utf-8") as f:
        m = re.search(r"عدد آياتها\s+(\d+)", f.read())
        if m:
            counts[i] = m.group(1)

# Update index - add (count) after each surah link
path = os.path.join(DIR, "index.html")
with open(path, "r", encoding="utf-8") as f:
    text = f.read()

for ch in range(114, 0, -1):
    count = counts.get(ch, "?")
    # Add (count) after surah name
    text = re.sub(
        rf'(href="ch_{ch:03d}\.html"><font[^>]*>)([^<]+)(</font></a>)',
        rf'\1\2 ({count})\3',
        text,
    )

with open(path, "w", encoding="utf-8") as f:
    f.write(text)

print("Done.")
