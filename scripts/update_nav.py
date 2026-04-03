import os
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DIR = os.path.join(ROOT, "public", "quran_chapters")

# Pattern to remove الصفحة الرئيسية button (whole td, with optional newlines)
HOME_PATTERN = re.compile(
    r'<td[^>]*>\s*<a href="[^"]*"><button[^>]*>الصفحة الرئيسية</button></a>\s*</td>',
    re.DOTALL | re.IGNORECASE
)

# Replace search link
SEARCH_OLD = 'href="http://holyquran.net/search/sindex.php"'
SEARCH_NEW = 'href="search.html"'

for fname in ["index.html"] + [f"ch_{i:03d}.html" for i in range(1, 115)]:
    path = os.path.join(DIR, fname)
    if not os.path.exists(path):
        continue
    with open(path, "r", encoding="utf-8") as f:
        text = f.read()
    text = HOME_PATTERN.sub("", text)
    text = text.replace(SEARCH_OLD, SEARCH_NEW)
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)
    print(f"Updated {fname}")

print("Done.")
