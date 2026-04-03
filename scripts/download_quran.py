import os
import requests
import time

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUTPUT_DIR = os.path.join(ROOT, "public", "quran_chapters")
os.makedirs(OUTPUT_DIR, exist_ok=True)

for ch in range(1, 115):
    url = f"http://holyquran.net/cgi-bin/prepare.pl?ch={ch}"
    try:
        r = requests.get(url, timeout=30)
        r.encoding = "windows-1256"
        path = os.path.join(OUTPUT_DIR, f"ch_{ch:03d}.html")
        text = r.text.replace("charset=windows-1256", "charset=utf-8")
        text = text.replace("http://holyquran.net/quran/index.html", "index.html")
        for n in range(114, 0, -1):
            text = text.replace(f"http://holyquran.net/cgi-bin/prepare.pl?ch={n}", f"ch_{n:03d}.html")
        with open(path, "w", encoding="utf-8") as f:
            f.write(text)
        print(f"Saved chapter {ch}/114")
    except Exception as e:
        print(f"Failed chapter {ch}: {e}")
    time.sleep(0.5)

# Download index (into same folder as chapters)
print("Downloading index...")
r = requests.get("http://holyquran.net/quran/index.html", timeout=30)
r.encoding = "windows-1256"
text = r.text.replace("charset=windows-1256", "charset=utf-8")
for ch in range(114, 0, -1):
    local = f"ch_{ch:03d}.html"
    text = text.replace(f"../cgi-bin/prepare.pl?ch={ch}", local)
    text = text.replace(f"http://holyquran.net/cgi-bin/prepare.pl?ch={ch}", local)
    text = text.replace(f"prepare.pl?ch={ch}", local)
with open(os.path.join(OUTPUT_DIR, "index.html"), "w", encoding="utf-8") as f:
    f.write(text)
print("Index saved.")

print("Done.")
