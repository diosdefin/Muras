"""Generate the Red Data Book Kyrgyzstan atlas dataset.

The script assembles a curated list of officially important species, enriches each
record with a Russian Wikipedia summary and conservation metadata, and creates the
pixelated front-end images used by the Vue atlas.
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any, TypedDict

import requests
from PIL import Image


CATEGORY_LABELS = {
    "all": "Все",
    "mammals": "Млекопитающие",
    "birds": "Птицы",
    "plants": "Растения",
    "insects": "Насекомые",
}

STATUS_POPULATION_FALLBACK = {
    "CR": 150,
    "EN": 800,
    "VU": 3500,
    "NT": 1500,
    "LC": 5500,
}


class Species(TypedDict):
    id: str
    category: str
    scientific_name: str
    name_ru: str
    name_kg: str
    name_en: str
    population: int
    population_history: int
    status: str
    description_ru: str
    description_kg: str
    description_en: str
    region: str
    threats: list[str]
    funding: list[dict[str, str]]


SPECIES: list[Species] = [
    {
        "id": "ak-ilbirs",
        "category": "mammals",
        "scientific_name": "Panthera uncia",
        "name_ru": "Ак илбирс",
        "name_kg": "Ак илбирс",
        "name_en": "Snow leopard",
        "population": 3500,
        "population_history": 12000,
        "status": "VU",
        "description_ru": "",
        "description_kg": "Кыргызстандын тоолуу жана alpine экосистемаларында жашаган сейрек жырткыч.",
        "description_en": "A rare mountain predator adapted to alpine and highland ecosystems.",
        "region": "Кыргызстан",
        "threats": ["Браконьерство", "Утрата местообитаний", "Сокращение кормовой базы"],
        "funding": [
            {
                "name": "NABU Kyrgyzstan",
                "url": "https://nabu-kyrgyzstan.org/",
                "account": "Платёжный портал · поддержка природоохранных программ",
            },
            {
                "name": "Snow Leopard Foundation Kyrgyzstan",
                "url": "https://snowleopardfoundation.kg/",
                "account": "Платёжный портал · сохранение снежного барса и горных экосистем",
            },
        ],
    },
    {
        "id": "tyanshan-brown-bear",
        "category": "mammals",
        "scientific_name": "Ursus arctos isabellinus",
        "name_ru": "Тянь-шаньский бурый медведь",
        "name_kg": "Тянь-Шань арцтуу аюу",
        "name_en": "Tien Shan brown bear",
        "population": 800,
        "population_history": 2000,
        "status": "EN",
        "description_ru": "",
        "description_kg": "Тянь-Шань тоолорунда жашаган чыныгы жырткыч жаныбар.",
        "description_en": "A mountain bear whose survival depends on intact alpine corridors and prey species.",
        "region": "Тянь-Шань",
        "threats": ["Столкновение с человеком", "Сокращение лесных коридоров", "Нарушение миграций"],
        "funding": [
            {
                "name": "NABU Kyrgyzstan",
                "url": "https://nabu-kyrgyzstan.org/",
                "account": "Платёжный портал · поддержка медвежьих коридоров и биоразнообразия",
            },
            {
                "name": "Snow Leopard Foundation Kyrgyzstan",
                "url": "https://snowleopardfoundation.kg/",
                "account": "Платёжный портал · охрана горных экосистем",
            },
        ],
    },
    {
        "id": "maral",
        "category": "mammals",
        "scientific_name": "Cervus elaphus songaricus",
        "name_ru": "Марал",
        "name_kg": "Марал",
        "name_en": "Maral",
        "population": 3500,
        "population_history": 9000,
        "status": "VU",
        "description_ru": "",
        "description_kg": "Кыргызстандын жогорку бийиктиктеги жайыттарында жашаган улук туяктуу жаныбар.",
        "description_en": "A large deer subspecies of the mountain ranges of Central Asia.",
        "region": "Кыргызстан",
        "threats": ["Перевыпас", "Лесозаготовки", "Репродуктивное давление"],
        "funding": [
            {
                "name": "NABU Kyrgyzstan",
                "url": "https://nabu-kyrgyzstan.org/",
                "account": "Платёжный портал · восстановление пастбищ и обитания",
            },
            {
                "name": "Snow Leopard Foundation Kyrgyzstan",
                "url": "https://snowleopardfoundation.kg/",
                "account": "Платёжный портал · поддержка горной фауны",
            },
        ],
    },
    {
        "id": "mountain-goose",
        "category": "birds",
        "scientific_name": "Anser indicus",
        "name_ru": "Горный гусь",
        "name_kg": "Тоолуу каз",
        "name_en": "Bar-headed goose",
        "population": 1500,
        "population_history": 4000,
        "status": "NT",
        "description_ru": "",
        "description_kg": "Ала тоолуу чөлөндөрдөгү көчмөн жана жетиштүү суусактуу жаныбар.",
        "description_en": "A migratory goose breeding on high mountain lakes and wetlands.",
        "region": "Кыргызстан",
        "threats": ["Утрата водно-болотных угодий", "Ухудшение миграционных остановок", "Антропогенное давление"],
        "funding": [
            {
                "name": "NABU Kyrgyzstan",
                "url": "https://nabu-kyrgyzstan.org/",
                "account": "Платёжный портал · поддержка водно-болотных экосистем",
            },
            {
                "name": "Snow Leopard Foundation Kyrgyzstan",
                "url": "https://snowleopardfoundation.kg/",
                "account": "Платёжный портал · сохранение миграционных маршрутов",
            },
        ],
    },
    {
        "id": "fritillaria-eduardii",
        "category": "plants",
        "scientific_name": "Fritillaria eduardii",
        "name_ru": "Цветок Айгуль",
        "name_kg": "Айгүл гулү",
        "name_en": "Fritillaria eduardii",
        "population": 150,
        "population_history": 500,
        "status": "CR",
        "description_ru": "",
        "description_kg": "Кыргызстандын жогорку тоолуу жайларында кездешүүчү сейрек гүл.",
        "description_en": "A rare high-altitude flowering plant with highly restricted habitat.",
        "region": "Кыргызстан",
        "threats": ["Сбор растений", "Утрата местообитаний", "Лесопосадки и выпас"],
        "funding": [
            {
                "name": "NABU Kyrgyzstan",
                "url": "https://nabu-kyrgyzstan.org/",
                "account": "Платёжный портал · сохранение редких растений и их местообитаний",
            },
            {
                "name": "Snow Leopard Foundation Kyrgyzstan",
                "url": "https://snowleopardfoundation.kg/",
                "account": "Платёжный портал · защита горных экосистем и биоразнообразия",
            },
        ],
    },
]


def fetch_wikipedia_summary(scientific_name: str) -> str:
    """Fetch the Russian Wikipedia lead paragraph for a scientific name."""
    params = {
        "action": "query",
        "prop": "extracts",
        "exintro": 1,
        "explaintext": 1,
        "redirects": 1,
        "titles": scientific_name,
        "format": "json",
        "utf8": 1,
    }

    try:
        response = requests.get(
            "https://ru.wikipedia.org/w/api.php",
            params=params,
            timeout=20,
        )
        response.raise_for_status()
        payload = response.json()
        pages = payload.get("query", {}).get("pages", {})
        for page in pages.values():
            extract = page.get("extract", "").strip()
            if extract:
                return re.sub(r"\s+", " ", extract)
    except (requests.RequestException, ValueError, TypeError):
        return ""

    return ""


def resolve_population(species: dict[str, Any]) -> int:
    """Use conservation status as a fallback when exact counts are unavailable."""
    population = int(species.get("population") or 0)
    if population > 0:
        return population
    status = str(species.get("status") or "VU").upper()
    return STATUS_POPULATION_FALLBACK.get(status, 1200)


def build_species_record(species: dict[str, Any]) -> dict[str, Any]:
    """Enrich one species record with local defaults, metadata and human-readable text."""
    record = dict(species)
    population = resolve_population(record)
    record["population"] = population
    record["population_history"] = max(int(record.get("population_history") or population * 3), population + 100)

    if not record.get("description_ru"):
        description = fetch_wikipedia_summary(record["scientific_name"])
        if description:
            record["description_ru"] = description[:500].strip()
        else:
            record["description_ru"] = (
                f"Редкий вид {record['name_ru']}, находящийся под пристальным вниманием "
                "национального мониторинга и природоохранных программ Кыргызской Республики."
            )

    if not record.get("name_kg"):
        record["name_kg"] = record["name_ru"]

    return record


def pixelate_image(
    image_path: Path | str,
    output_path: Path | str,
    population: int,
    width: int = 800,
    height: int = 600,
) -> None:
    """Pixelate an image using a population-based grid and save the result."""
    if population <= 0:
        raise ValueError("population must be greater than zero")
    if width <= 0 or height <= 0:
        raise ValueError("width and height must be greater than zero")

    image_path = Path(image_path)
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with Image.open(image_path) as source:
        source_width, source_height = source.size
        aspect_ratio = source_width / source_height
        cols = max(8, min(200, int((population * aspect_ratio) ** 0.5)))
        rows = max(8, min(200, int(population / cols)))

        pixelated = source.convert("RGB").resize((cols, rows), resample=Image.Resampling.BILINEAR)
        pixelated.resize((width, height), resample=Image.Resampling.NEAREST).save(output_path)


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
    """Process available source images and write the front-end species database."""
    project_root = Path(project_root)
    source_dir = project_root / "public" / "images" / "source"
    processed_dir = project_root / "public" / "images" / "processed"
    data_path = project_root / "public" / "data" / "species.json"
    processed_dir.mkdir(parents=True, exist_ok=True)
    data_path.parent.mkdir(parents=True, exist_ok=True)

    records: list[dict[str, Any]] = []
    for raw_species in SPECIES:
        record = build_species_record(raw_species)

        source_image = _find_source_image(source_dir, record["id"])
        if source_image is not None:
            output_path = processed_dir / f"{record['id']}.png"
            pixelate_image(
                source_image,
                output_path,
                record["population"],
                width,
                height,
            )
            record["image"] = f"/images/processed/{output_path.name}"
        else:
            record["image"] = None
            print(f"Source image not found for {record['id']}; add it to public/images/source/ to process it.")

        records.append(record)

    data_path.write_text(
        json.dumps(records, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return records


def main() -> None:
    """Generate public/data/species.json and the associated processed images."""
    project_root = Path(__file__).resolve().parent.parent
    generate_database(project_root)
    print("Atlas database generated at public/data/species.json")


if __name__ == "__main__":
    main()
