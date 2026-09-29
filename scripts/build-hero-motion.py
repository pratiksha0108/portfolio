"""Build static hero assets. Requires Pillow and PyAV only for regeneration.
Usage: python scripts/build-hero-motion.py /path/to/source.mp4
"""
import json
import sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/hero-motion'
PATHS = {
    'left': [26, *range(34, 47)],
    'right': [26, 79, 81, 83, *range(84, 97)],
    'up': [26, *range(122, 135)],
    'down': [26, 203, 202, 201, 200, 199, 198, *range(165, 173)],
}
FRAMES = list(dict.fromkeys(i for path in PATHS.values() for i in path))
PATCH = (416, 160, 864, 720)
COLS, ROWS = 4, 4

def build(frames):
    OUT.mkdir(parents=True, exist_ok=True)
    frames[26].save(OUT / 'neutral.webp', quality=94, method=6)
    for start in range(0, len(FRAMES), COLS * ROWS):
        ids = FRAMES[start:start + COLS * ROWS]
        sheet = Image.new('RGB', (448 * COLS, 560 * ((len(ids)+COLS-1)//COLS)))
        for slot, index in enumerate(ids):
            sheet.paste(frames[index].crop(PATCH), ((slot % COLS)*448, (slot//COLS)*560))
        sheet.save(OUT / f'poses-{start//(COLS*ROWS)}.webp', quality=94, method=6)
    data = {'neutral': 26, 'source': {'width':1280,'height':720,'fps':24},
            'patch': {'x':416,'y':160,'width':448,'height':560},
            'columns':COLS,'perSheet':COLS*ROWS,'frames':FRAMES,'paths':PATHS}
    (ROOT / 'components/hero-assets.json').write_text(json.dumps(data, indent=2)+'\n')

if __name__ == '__main__':
    import av
    with av.open(sys.argv[1]) as video:
        frames = {i:f.to_image() for i,f in enumerate(video.decode(video.streams.video[0])) if i in FRAMES}
    build(frames)
