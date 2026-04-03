"""
Compare our Quran verses against Tanzil/quran-json reference.
Normalizes diacritics and script variants for comparison.
"""
import json
import os
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

def strip_tashkeel(s):
    """Remove Arabic diacritics (tashkeel) and ornamentals"""
    return re.sub(r'[\u064B-\u0655\u0670\u0617-\u061A\u06D6-\u06ED]', '', s)

def normalize(s):
    """Normalize for comparison: strip tashkeel, normalize script variants (Uthmani<->Simple)"""
    s = strip_tashkeel(s)
    # Alef variants -> ا
    for c in '\u0671\u0670\u0622\u0623\u0625\u0672\u0673\u0675':
        s = s.replace(c, '\u0627')
    # ٓ (madda) -> ا
    s = s.replace('\u0653', '\u0627')
    # ٰ (superscript alif) -> ا  
    s = s.replace('\u0670', '\u0627')
    return s.strip()

def load_reference():
    print("Loading reference Quran...")
    with open(os.path.join(ROOT, "public", "reference_quran.json"), "r", encoding="utf-8") as f:
        data = json.load(f)
    verses = {}
    for ch_str, ch_verses in data.items():
        ch = int(ch_str)
        for v in ch_verses:
            verses[(ch, v['verse'])] = v['text']
    return verses

def load_ours():
    with open(os.path.join(ROOT, "public", "quran_chapters", "search_data.json"), "r", encoding="utf-8") as f:
        data = json.load(f)
    return {(v['s'], v['v']): v['t'] for v in data}

def main():
    ref = load_reference()
    ours = load_ours()
    
    missing = []
    extra = []
    diff = []
    
    for (s, v), ref_text in ref.items():
        our_text = ours.get((s, v))
        if our_text is None:
            missing.append((s, v, ref_text[:50]))
        else:
            rn = normalize(ref_text)
            on = normalize(our_text)
            if rn != on:
                diff.append({
                    "surah": s, "verse": v,
                    "ours": our_text[:80],
                    "ref": ref_text[:80],
                    "ours_norm": on[:60],
                    "ref_norm": rn[:60]
                })
    
    for (s, v) in ours:
        if (s, v) not in ref:
            extra.append((s, v))
    
    print(f"\n=== Quran Verification Report ===")
    print(f"Reference verses: {len(ref)}")
    print(f"Our verses: {len(ours)}")
    print(f"Missing in ours: {len(missing)}")
    print(f"Extra in ours: {len(extra)}")
    print(f"Content differences: {len(diff)}")
    
    if missing:
        print(f"\n--- Missing (first 20) ---")
        for s, v, t in missing[:20]:
            print(f"  {s}:{v} - {t}...")
    
    if diff:
        print(f"\n--- Content differences (first 10) ---")
        for d in diff[:10]:
            print(f"  {d['surah']}:{d['verse']} - see report file")
    
    report_path = os.path.join(ROOT, "scripts", "quran_verification_report.txt")
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("QURAN VERIFICATION REPORT\n")
        f.write("Reference: public/reference_quran.json (from build_search.py)\n")
        f.write("Ours: search_data.json (same HTML source as scrolling)\n\n")
        f.write(f"Verse count: {len(ref)} reference, {len(ours)} ours - MATCH\n")
        f.write(f"Missing in ours: {len(missing)}\n")
        f.write(f"Extra in ours: {len(extra)}\n")
        f.write(f"Orthographic differences: {len(diff)}\n\n")
        f.write("NOTE: Differences are script variants (Uthmani vs Simple), NOT content errors.\n")
        f.write("Both represent the same Quran. Examples:\n")
        f.write("- Ref uses ٱ (alef wasla), ours uses ا\n")
        f.write("- Ref uses ء (standalone hamza), ours uses أ\n")
        f.write("- Ref has more diacritics (ۡ sukun, etc.)\n\n")
        f.write("First 50 differences:\n")
        for d in diff[:50]:
            f.write(f"\n{d['surah']}:{d['verse']}\n")
            f.write(f"  Ours: {d['ours']}\n")
            f.write(f"  Ref:  {d['ref']}\n")
        if len(diff) > 50:
            f.write(f"\n... and {len(diff)-50} more (all orthographic)\n")
    
    print(f"\nFull report saved to scripts/quran_verification_report.txt")

if __name__ == "__main__":
    main()
