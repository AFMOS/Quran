"""
Extract verse text from ch_XXX.html (scrolling source) into:
  - public/quran_chapters/search_data.json  (flat list for search)
  - public/reference_quran.json             (nested by surah; page mode uses this)

Run after editing chapter HTML so page mode and scrolling stay identical.
"""
import os
import re
import json

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DIR = os.path.join(ROOT, "public", "quran_chapters")
PUBLIC = os.path.join(ROOT, "public")

# Extract verse text from <li><p><font>...</font></p></li>
VERSE_PATTERN = re.compile(
    r'<li[^>]*>.*?<font[^>]*>\s*(.*?)\s*</font>',
    re.DOTALL
)

def extract_verses(html):
    ol_match = re.search(r'<ol[^>]*>(.*?)</ol>', html, re.DOTALL)
    if not ol_match:
        return []
    ol_content = ol_match.group(1)
    verses = []
    for m in VERSE_PATTERN.finditer(ol_content):
        text = m.group(1).strip()
        text = re.sub(r'\s+', ' ', text)
        if text and not text.startswith('<') and 'عدد آياتها' not in text:
            verses.append(text)
    return verses

data = []
for ch in range(1, 115):
    path = os.path.join(DIR, f"ch_{ch:03d}.html")
    with open(path, "r", encoding="utf-8") as f:
        html = f.read()
    verses = extract_verses(html)
    for i, text in enumerate(verses, 1):
        data.append({"s": ch, "v": i, "t": text})

with open(os.path.join(DIR, "search_data.json"), "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False)

by_surah = {}
for item in data:
    s = item["s"]
    key = str(s)
    if key not in by_surah:
        by_surah[key] = []
    by_surah[key].append(
        {"chapter": s, "verse": item["v"], "text": item["t"]}
    )

with open(os.path.join(PUBLIC, "reference_quran.json"), "w", encoding="utf-8") as f:
    json.dump(by_surah, f, ensure_ascii=False)

print(f"Extracted {len(data)} verses -> search_data.json + reference_quran.json")
