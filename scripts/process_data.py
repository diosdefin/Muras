"""Create pixelated species images and the JSON data used by the Vue app.

Install the image dependency first:
    pip install Pillow
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, TypedDict

from PIL import Image


class Species(TypedDict):
    id: str
    name_ru: str
    name_kg: str
    name_en: str
    population: int
    population_history: int
    pixel_scale: int
    status: str
    description_ru: str
    description_kg: str
    description_en: str
    region: str
    threats: list[str]
    donation_funds: list[dict[str, str]]


SPECIES: list[Species] = [
    {
        "id": "irbis",
        "name_ru": "Ирбис",
        "name_kg": "Илбирс",
        "name_en": "Snow leopard",
        "population": 4000,
        "population_history": 20000,
        "pixel_scale": 333,
        "status": "VU",
        "description_ru": (
            "Редкий хищник горных экосистем Кыргызстана, известный своей "
            "выносливостью и скрытным образом жизни."
        ),
        "description_kg": "Кыргызстандын тоолуу аймактарында жашаган сейрек жырткыч.",
        "description_en": "A rare mountain predator found in Kyrgyzstan.",
        "region": "Кыргызстан",
        "threats": ["Браконьерство", "Сокращение кормовой базы", "Изменение климата"],
        "donation_funds": [
            {
                "name": "Snow Leopard Foundation Kyrgyzstan",
                "description": "Защита и мониторинг популяций снежного барса в КР.",
                "url": "https://www.snowleopard.org.kg",
            },
            {
                "name": "NABU Кыргызстан",
                "description": "Охрана природы и защита снежного барса на Тянь-Шане.",
                "url": "https://nabu.kg",
            },
        ],
    },
    {
        "id": "amur-tiger",
        "name_ru": "Амурский тигр",
        "name_kg": "Амур жолборсу",
        "name_en": "Amur tiger",
        "population": 750,
        "population_history": 3000,
        "pixel_scale": 63,
        "status": "EN",
        "description_ru": (
            "Крупнейшая кошка планеты, обитающая в лесах Дальнего Востока."
        ),
        "description_kg": "Ыраакы Чыгыштын токойлорунда жашаган чоң мышык.",
        "description_en": "The largest cat species, living in the forests of the Russian Far East.",
        "region": "Дальний Восток",
        "threats": ["Вырубка лесов", "Браконьерство", "Фрагментация ареала"],
        "donation_funds": [
            {
                "name": "WWF",
                "description": "Поддержка программ сохранения тигров и их местообитаний.",
                "url": "https://www.worldwildlife.org/species/tiger",
            },
            {
                "name": "Центр «Амурский тигр»",
                "description": "Сохранение и восстановление популяции амурского тигра.",
                "url": "https://amur-tiger.ru",
            },
        ],
    },
    {
        "id": "whooping-crane",
        "name_ru": "Американский журавль",
        "name_kg": "Америка турнасы",
        "name_en": "Whooping crane",
        "population": 150000,
        "population_history": 350000,
        "pixel_scale": 3125,
        "status": "CR",
        "description_ru": (
            "Редкая перелётная птица, которой угрожают потеря болотных "
            "местообитаний и изменение миграционных маршрутов."
        ),
        "description_kg": "Саздак жерлерге көз каранды болгон сейрек көчмөн куш.",
        "description_en": "A rare migratory bird dependent on wetland habitats.",
        "region": "Северная Америка",
        "threats": ["Утрата болот", "Изменение миграционных маршрутов"],
        "donation_funds": [
            {
                "name": "International Crane Foundation",
                "description": "Охрана журавлей и восстановление водно-болотных угодий.",
                "url": "https://savingcranes.org",
            },
            {
                "name": "Whooping Crane Conservation Association",
                "description": "Поддержка сохранения американского журавля и его миграций.",
                "url": "https://savingcranes.org/whooping-crane",
            },
        ],
    },
]


def pixelate_image(
    image_path: Path | str,
    output_path: Path | str,
    population: int,
    width: int = 800,
    height: int = 600,
    individuals_per_pixel: int = 1000,
) -> None:
    """Pixelate an image using an individual population-to-pixel scale."""
    if population <= 0:
        raise ValueError("population must be greater than zero")
    if individuals_per_pixel <= 0:
        raise ValueError("individuals_per_pixel must be greater than zero")
    if width <= 0 or height <= 0:
        raise ValueError("width and height must be greater than zero")

    image_path = Path(image_path)
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with Image.open(image_path) as source:
        source_width, source_height = source.size
        aspect_ratio = source_width / source_height
        cols = max(12, min(200, round(population / individuals_per_pixel)))
        rows = max(1, round(cols / aspect_ratio))

        pixelated = source.convert("RGB").resize(
            (cols, rows), resample=Image.Resampling.BILINEAR
        )
        pixelated.resize(
            (width, height), resample=Image.Resampling.NEAREST
        ).save(output_path)


def _find_source_image(source_dir: Path, species_id: str) -> Path | None:
    """Find a source image by species id, regardless of common extension."""
    for extension in (".jpg", ".jpeg", ".png", ".webp"):
        candidate = source_dir / f"{species_id}{extension}"
        if candidate.is_file():
            return candidate
    return None


def generate_database(
    project_root: Path | str,
    width: int = 800,
    height: int = 600,
) -> list[dict[str, Any]]:
    """Process available source images and write the frontend species database."""
    project_root = Path(project_root)
    source_dir = project_root / "public" / "images" / "source"
    processed_dir = project_root / "public" / "images" / "processed"
    data_path = project_root / "public" / "data" / "species.json"
    processed_dir.mkdir(parents=True, exist_ok=True)
    data_path.parent.mkdir(parents=True, exist_ok=True)

    records: list[dict[str, Any]] = []
    for species in SPECIES:
        record: dict[str, Any] = dict(species)
        source_image = _find_source_image(source_dir, species["id"])
        if source_image is not None:
            output_path = processed_dir / f"{species['id']}.png"
            pixelate_image(
                source_image,
                output_path,
                species["population"],
                width,
                height,
                individuals_per_pixel=species["pixel_scale"],
            )
            record["image"] = f"/images/processed/{output_path.name}"
        else:
            record["image"] = None
            print(
                f"Source image not found for {species['id']}; "
                "add it to public/images/source/ to process it."
            )
        records.append(record)

    data_path.write_text(
        json.dumps(records, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return records


def main() -> None:
    """Generate public/data/species.json and any available pixel images."""
    project_root = Path(__file__).resolve().parent.parent
    generate_database(project_root)
    print("Species database generated at public/data/species.json")


if __name__ == "__main__":
    main()
