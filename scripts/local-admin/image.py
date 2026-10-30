"""Local editor only: inspect bounded raster uploads; reuse the established WebP pipeline."""
import sys,json
from pathlib import Path
from PIL import Image
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from process_data import optimize_image
Image.MAX_IMAGE_PIXELS=40000000
with Image.open(sys.argv[1]) as image:
    if image.format not in ("JPEG","PNG","WEBP") or image.width*image.height>40000000 or getattr(image,"n_frames",1)!=1:
        raise ValueError("Only a single bounded JPEG/PNG/WebP raster is allowed")
    result={"width":image.width,"height":image.height,"format":image.format.lower()}
    image.verify()
with Image.open(sys.argv[1]) as decoded:
    decoded.load()
if len(sys.argv)>2:
    result["optimized"]=optimize_image(Path(sys.argv[1]),Path(sys.argv[2]),1800,82)
print(json.dumps(result))
