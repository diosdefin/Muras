# Redbook

## Data processing

The Python script generates the species database and pixelated images:

```bash
pip install Pillow
python scripts/process_data.py
```

Place source images in `public/images/source/` using the species id as the
filename, for example `irbis.jpg` or `amur-tiger.png`. The script writes
processed images to `public/images/processed/` and the frontend data to
`public/data/species.json`.