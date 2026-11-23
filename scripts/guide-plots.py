"""Data Visualization guide: runs every python snippet of the notes in order (notebook style),
fills each output fence with the real stdout, and saves the figure of each snippet as the image
that follows it (public/guides/data-visualization/<name>.webp; "#WxH" is added to the image URL
so the page reserves the space before the image loads).

    pip install matplotlib seaborn pandas scikit-learn
    python scripts/guide-plots.py

Seaborn's sample datasets download on first use. Prints any error or warning per snippet.
"""
import contextlib
import io
import os
import re
import tempfile
import traceback
import warnings

import matplotlib

matplotlib.use('Agg')
import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
from PIL import Image  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NOTES = os.path.join(ROOT, 'src', 'content', 'guides', 'data-visualization', 'notes.md')
OUT = os.path.join(ROOT, 'public', 'guides', 'data-visualization')
IMG = re.compile(r'^!\[[^\]]*\]\(/guides/data-visualization/([\w-]+)\.webp(?:#\d+x\d+)?\)$')
SIZES: dict[str, tuple[int, int]] = {}


def save(fig, name):
    path = os.path.join(OUT, name + '.webp')
    fig.savefig(path, dpi=100, bbox_inches='tight', pil_kwargs={'quality': 82, 'method': 6})
    with Image.open(path) as im:
        SIZES[name] = im.size


def anatomy():
    """The labelled 'parts of a figure' picture (not a snippet in the notes)."""
    fig, ax = plt.subplots(figsize=(8, 4.6))
    fig.patch.set_facecolor('#f3f4f8')
    x = np.linspace(0, 10, 100)
    ax.plot(x, np.sin(x) + 2, label='line (Artist)')
    ax.scatter(x[::8], np.cos(x[::8]) + 2, color='tab:orange', label='scatter (Artist)', zorder=3)
    ax.set_title('Title  ← ax.set_title()')
    ax.set_xlabel('x label  ← ax.set_xlabel()')
    ax.set_ylabel('y label')
    ax.legend(loc='upper right')
    ax.grid(alpha=0.3)
    ax.set_ylim(0, 4.2)
    kw = dict(fontsize=10, color='#b4232c', fontweight='bold')
    arrow = dict(arrowstyle='->', color='#b4232c')
    ax.annotate('Axes (one plot)', xy=(0.5, 0.5), xytext=(3.2, 3.6), **kw)
    ax.annotate('major tick + tick label\n(ax.xaxis)', xy=(6, 0), xytext=(6.4, 0.45),
                arrowprops=arrow, **kw)
    ax.annotate('y axis (ax.yaxis)', xy=(0, 1.0), xytext=(0.4, 0.55), arrowprops=arrow, **kw)
    ax.annotate('legend', xy=(7.3, 3.7), xytext=(5.6, 3.05), arrowprops=arrow, **kw)
    ax.annotate('spine', xy=(10, 1.6), xytext=(8.4, 1.0), arrowprops=arrow, **kw)
    fig.text(0.01, 0.97, 'Figure (the whole canvas)', fontsize=11, color='#3b3b8f',
             fontweight='bold', va='top')
    return fig


def with_size(line):
    m = IMG.match(line.strip())
    if not m or m.group(1) not in SIZES:
        return line
    w, h = SIZES[m.group(1)]
    return re.sub(r'\.webp(?:#\d+x\d+)?\)', f'.webp#{w}x{h})', line)


def main():
    os.makedirs(OUT, exist_ok=True)
    lines = open(NOTES, encoding='utf8').read().replace('\r\n', '\n').split('\n')
    plt.show = lambda *a, **k: None
    os.chdir(tempfile.mkdtemp())  # snippets that savefig() write here, not into the repo

    ns: dict = {}
    out: list[str] = []
    problems: list[tuple[str, str, str]] = []
    done: list[str] = []
    i = 0
    while i < len(lines):
        line = lines[i]
        out.append(line)
        if line.strip() != '```python':
            m = IMG.match(line.strip())
            if m and m.group(1) == 'anatomy':
                save(anatomy(), 'anatomy')
                done.append('anatomy')
                plt.close('all')
            i += 1
            continue

        j = i + 1
        while lines[j].strip() != '```':
            j += 1
        code = '\n'.join(lines[i + 1:j])
        first = code.split('\n')[0]
        out.extend(lines[i + 1:j + 1])
        buf = io.StringIO()
        with warnings.catch_warnings(record=True) as caught:
            warnings.simplefilter('always')
            try:
                with contextlib.redirect_stdout(buf):
                    exec(compile(code, '<snippet>', 'exec'), ns)
            except Exception:
                problems.append(('ERROR', first, traceback.format_exc(limit=2)))
        problems += [('WARN', first, f'{w.category.__name__}: {w.message}') for w in caught]
        stdout = buf.getvalue().rstrip('\n')
        figs = [plt.figure(n) for n in plt.get_fignums()]

        # What follows the snippet: blank lines, an optional plain output fence, images.
        k = j + 1
        while k < len(lines):
            nxt = lines[k]
            if nxt.strip() == '':
                out.append(nxt)
                k += 1
            elif nxt.strip() == '```':
                end = k + 1
                while lines[end].strip() != '```':
                    end += 1
                out += ['```', *(stdout.split('\n') if stdout else ['(no output)']), '```']
                if not stdout:
                    problems.append(('NO OUTPUT', first, ''))
                k = end + 1
            elif m := IMG.match(nxt.strip()):
                if figs:
                    save(figs[-1], m.group(1))
                    done.append(m.group(1))
                else:
                    problems.append(('NO FIGURE', m.group(1), ''))
                out.append(nxt)
                k += 1
            else:
                break
        plt.close('all')
        i = k

    with open(NOTES, 'w', encoding='utf8', newline='\n') as f:
        f.write('\n'.join(with_size(line) for line in out))
    referenced = [m.group(1) for line in lines if (m := IMG.match(line.strip()))]
    print('images:', len(done), 'referenced:', len(referenced),
          'missing:', sorted(set(referenced) - set(done)))
    for kind, where, detail in problems:
        print(f'{kind}: {where}\n{detail}\n' + '-' * 40)


if __name__ == '__main__':
    main()
