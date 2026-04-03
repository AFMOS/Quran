"""
Remove legacy top/bottom nav from quran_chapters/ch_*.html using balanced <table> / <tr>
scans only (no full HTML rewrite — preserves document structure).
"""
import re
from pathlib import Path


def find_table_span(s: str, from_pos: int = 0):
    """Return (start, end) of first <table>...</table> from from_pos, handling nesting."""
    m = re.search(r"<table\b", s[from_pos:], re.I)
    if not m:
        return None
    start = from_pos + m.start()
    depth = 0
    i = start
    n = len(s)
    while i < n:
        if re.match(r"<table\b", s[i:], re.I):
            depth += 1
            gt = s.find(">", i)
            if gt == -1:
                return None
            i = gt + 1
            continue
        if s[i : i + 8].lower() == "</table>":
            depth -= 1
            i += 8
            if depth == 0:
                return (start, i)
            continue
        i += 1
    return None


def find_div_center_start(s: str):
    m = re.search(r'<div[^>]*align\s*=\s*["\']?center["\']?[^>]*>', s, re.I)
    if not m:
        return None
    return m.end()


def direct_tr_spans(table_inner: str):
    """table_inner = content inside <table ...> ... </table> (excluding outer tags)."""
    spans = []
    i = 0
    n = len(table_inner)
    depth = 0
    tr_start = None
    while i < n:
        if re.match(r"<table\b", table_inner[i:], re.I):
            depth += 1
            gt = table_inner.find(">", i)
            if gt == -1:
                break
            i = gt + 1
            continue
        if table_inner[i : i + 8].lower() == "</table>":
            depth -= 1
            i += 8
            continue
        if depth == 0 and re.match(r"<tr\b", table_inner[i:], re.I):
            if tr_start is not None:
                spans.append((tr_start, i))
            tr_start = i
            gt = table_inner.find(">", i)
            if gt == -1:
                break
            i = gt + 1
            continue
        if depth == 0 and table_inner[i : i + 5].lower() == "</tr>":
            if tr_start is not None:
                spans.append((tr_start, i + 5))
                tr_start = None
            i += 5
            continue
        i += 1
    return spans


def strip_second_table_nav(table_html: str) -> str:
    """Remove last 3 direct <tr>...</tr> from a full <table>...</table> string."""
    m = re.match(r"(<table\b[^>]*>)([\s\S]*)(</table>)", table_html, re.I)
    if not m:
        return table_html
    open_tag, inner, close_tag = m.group(1), m.group(2), m.group(3)
    spans = direct_tr_spans(inner)
    if len(spans) <= 3:
        return table_html
    keep = spans[:-3]
    new_inner = "".join(inner[a:b] for a, b in keep)
    return open_tag + new_inner + close_tag


def strip_file(html: str) -> str:
    div_pos = find_div_center_start(html)
    if div_pos is None:
        raise ValueError("no div align=center")

    # First top-level table inside div (nav block)
    t1 = find_table_span(html, div_pos)
    if not t1:
        raise ValueError("no first table")
    s0, s1 = t1
    html = html[:s0] + html[s1:]

    # Re-find div and first remaining table (was second table)
    div_pos = find_div_center_start(html)
    if div_pos is None:
        raise ValueError("no div after first strip")
    t2 = find_table_span(html, div_pos)
    if not t2:
        raise ValueError("no second table")
    a0, a1 = t2
    table_block = html[a0:a1]
    new_table = strip_second_table_nav(table_block)
    html = html[:a0] + new_table + html[a1:]
    return html


def process_file(path: Path) -> bool:
    raw = path.read_text(encoding="utf-8")
    try:
        out = strip_file(raw)
    except ValueError as e:
        print(f"FAIL {path.name}: {e}")
        return False
    path.write_text(out, encoding="utf-8")
    return True


def main():
    root = Path(__file__).resolve().parent.parent / "public" / "quran_chapters"
    files = sorted(root.glob("ch_*.html"))
    ok = 0
    for f in files:
        if process_file(f):
            ok += 1
    print(f"Updated {ok}/{len(files)} files.")


if __name__ == "__main__":
    main()
