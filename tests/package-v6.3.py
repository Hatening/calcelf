#!/usr/bin/env python3
"""Package CalcElf v6.3 full tree into 3 balanced zips.
- Excludes node_modules/, v6.zip, .git/, __pycache__
- Preserves directory structure in each zip
- Union of 3 zips == full tree, zero overlap
- Verifies with zipfile after creation
"""
import os, sys, zipfile, json

ROOT = '/home/user/Doubao/chats/38442579084875522/_v6base'
OUT_DIR = '/home/user/Doubao/chats/38442579084875522'
EXCLUDE_DIRS = {'node_modules', '.git', '__pycache__'}
EXCLUDE_FILES = {'v6.zip'}

def collect_files(root):
    files = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS]
        for fn in filenames:
            if fn in EXCLUDE_FILES:
                continue
            fp = os.path.join(dirpath, fn)
            rel = os.path.relpath(fp, root)
            size = os.path.getsize(fp)
            files.append((rel, fp, size))
    return files

def split_balanced(files, n=3):
    """Greedy: sort by size desc, assign to currently-lightest group."""
    files_sorted = sorted(files, key=lambda x: -x[2])
    groups = [[] for _ in range(n)]
    sizes = [0] * n
    for f in files_sorted:
        idx = sizes.index(min(sizes))
        groups[idx].append(f)
        sizes[idx] += f[2]
    return groups, sizes

def make_zip(zip_path, files, root):
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
        for rel, fp, size in files:
            zf.write(fp, rel)
    return os.path.getsize(zip_path)

def verify_zips(zip_paths, all_files):
    all_rel = set(f[0] for f in all_files)
    seen = set()
    for zp in zip_paths:
        with zipfile.ZipFile(zp, 'r') as zf:
            names = set(zf.namelist())
            # Check no overlap
            overlap = seen & names
            if overlap:
                print(f"ERROR: overlap in {zp}: {list(overlap)[:5]}")
                return False
            seen |= names
            # Check zip integrity
            bad = zf.testzip()
            if bad:
                print(f"ERROR: bad file in {zp}: {bad}")
                return False
    # Check union == full tree
    missing = all_rel - seen
    extra = seen - all_rel
    if missing:
        print(f"ERROR: {len(missing)} files missing from zips")
        return False
    if extra:
        print(f"ERROR: {len(extra)} extra files in zips")
        return False
    return True

def main():
    files = collect_files(ROOT)
    total_size = sum(f[2] for f in files)
    print(f"Total files: {len(files)}, total size: {total_size/1024/1024:.1f} MB")

    groups, sizes = split_balanced(files, 3)
    for i, (g, s) in enumerate(zip(groups, sizes)):
        print(f"  Group {i+1}: {len(g)} files, {s/1024/1024:.1f} MB")

    zip_paths = []
    for i, g in enumerate(groups):
        zp = os.path.join(OUT_DIR, f'CalcElf-v6.3-part{i+1}.zip')
        zs = make_zip(zp, g, ROOT)
        zip_paths.append(zp)
        print(f"Created {os.path.basename(zp)}: {zs/1024/1024:.1f} MB ({len(g)} files)")

    print("\nVerifying...")
    if verify_zips(zip_paths, files):
        print("PASS: union == full tree, zero overlap, all zips valid")
    else:
        print("FAIL: verification failed")
        sys.exit(1)

    # Print manifest
    manifest = {'total_files': len(files), 'total_size': total_size, 'zips': []}
    for zp, g in zip(zip_paths, groups):
        manifest['zips'].append({'file': os.path.basename(zp), 'files': len(g), 'size': os.path.getsize(zp)})
    with open(os.path.join(OUT_DIR, 'CalcElf-v6.3-manifest.json'), 'w') as f:
        json.dump(manifest, f, indent=2)
    print(f"Manifest written to CalcElf-v6.3-manifest.json")

if __name__ == '__main__':
    main()
