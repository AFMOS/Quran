"""
Legacy: search used to inline ~1.5MB of JSON into search.html.
Search now loads search_data.json via fetch — keep HTML small and cacheable.

To refresh verse index only, run: python scripts/build_search.py
"""

import os
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
QC = os.path.join(ROOT, "public", "quran_chapters")
data_path = os.path.join(QC, "search_data.json")
if os.path.isfile(data_path):
    print("search.html loads search_data.json at runtime; no embed needed.")
else:
    print("Missing search_data.json — run: python scripts/build_search.py", file=sys.stderr)
    sys.exit(1)
