import json
import os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
QC = os.path.join(ROOT, "public", "quran_chapters")

with open(os.path.join(QC, "search_data.json"), "r", encoding="utf-8") as f:
    data = json.load(f)

with open(os.path.join(QC, "search.html"), "r", encoding="utf-8") as f:
    html = f.read()

old = "fetch('search_data.json').then(r=>r.json()).then(d=>{\n  data = d;\n  document.getElementById('q').focus();\n});"
new = "data = " + json.dumps(data, ensure_ascii=False) + ";\ndocument.getElementById('q').focus();"
html = html.replace(old, new)

with open(os.path.join(QC, "search.html"), "w", encoding="utf-8") as f:
    f.write(html)

print("Embedded data in search.html")
