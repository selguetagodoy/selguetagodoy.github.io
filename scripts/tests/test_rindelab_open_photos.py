"""Unit tests for conservative photo matching and legal metadata (no network)."""
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[1] / "rindelab-open-photos.py"
spec = importlib.util.spec_from_file_location("rindelab_open_photos", SCRIPT)
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)


class OpenPhotoTests(unittest.TestCase):
    def test_model_base_preserves_model_number(self):
        self.assertEqual(m.model_base("Peugeot", "3008 1.6T GLX CVT 4x2"), "3008")
        self.assertEqual(m.model_base("Ford", "Ranger Raptor 2.0 TDI AT 4x4"), "RANGER RAPTOR")
        self.assertEqual(m.model_base("BMW", "X3 2.0 DCT"), "X3")
        self.assertEqual(m.model_base("Kia", "Kia Cerato 5 EX 1.6L 6AT"), "CERATO 5")

    def test_license_allowlist(self):
        self.assertEqual(m.license_info("CC BY-SA 4.0", "https://creativecommons.org/licenses/by-sa/4.0/"),
                         ("CC BY-SA 4.0", "https://creativecommons.org/licenses/by-sa/4.0/"))
        self.assertEqual(m.license_info("by-sa", "https://creativecommons.org/licenses/by-sa/4.0/", "4.0")[0], "CC BY-SA 4.0")
        self.assertEqual(m.license_info("CC0", "https://creativecommons.org/publicdomain/zero/1.0/")[0], "CC0")
        self.assertEqual(m.license_info("PDM", "https://creativecommons.org/publicdomain/mark/1.0/")[0], "PDM")
        self.assertIsNone(m.license_info("CC BY-NC 4.0", "https://creativecommons.org/licenses/by-nc/4.0/"))
        self.assertIsNone(m.license_info("CC BY-ND 4.0", "https://creativecommons.org/licenses/by-nd/4.0/"))
        self.assertIsNone(m.license_info("CC BY-SA 1.0", "https://creativecommons.org/licenses/by-sa/1.0/"))
        self.assertIsNone(m.license_info("All rights reserved"))
        self.assertIsNone(m.license_info("CC BY 4.0", "https://bad.example/by/4.0/"))

    def test_title_relevance_and_body(self):
        self.assertEqual(m.relevant("2022 Kia Cerato Sedan photo", "", "Kia", "CERATO", "2022", "sedan"),
                         (True, "exact_year"))
        self.assertEqual(m.relevant("2022 Kia Cerato Hatchback", "", "Kia", "CERATO", "2022", "sedan"),
                         (False, "unmatched"))
        self.assertEqual(m.relevant("2022 Kia Cerato engine bay", "", "Kia", "CERATO", "2022", "sedan"),
                         (False, "unmatched"))
        self.assertEqual(m.relevant("2022 Toyota Corolla", "", "Kia", "CERATO", "2022", ""), (False, "unmatched"))
        self.assertEqual(m.relevant("2010 Kia Cerato", "", "Kia", "CERATO", "2022", ""), (False, "unmatched"))
        # Real false positives caught by the 20-row RindeLab pilot.
        self.assertEqual(m.relevant("Jaguar I-Pace e-Trophy racer", "", "Jaguar", "E PACE", "2024", ""), (False, "unmatched"))
        self.assertEqual(m.relevant("2018 Jaguar XF Sportbrake S, July 2023", "", "Jaguar", "XF", "2023", ""), (False, "unmatched"))
        self.assertEqual(m.relevant("1997 Jeep Grand Cherokee Laredo, May 2021", "", "Jeep", "GRAND CHEROKEE L", "2021", ""), (False, "unmatched"))
        self.assertEqual(m.relevant("2023 Ford Explorer ST in White, August 2024", "", "Ford", "EXPLORER ST", "2024", ""), (True, "model_family"))
        self.assertEqual(m.model_base("Jeep", "Grand Cherokee L Limited 3.6L 4x4"), "GRAND CHEROKEE L")
        self.assertEqual(m.relevant("Audi A5 Quattro Sportback 2017", "", "Audi", "A5", "2017", "coupe"), (False, "unmatched"))
        self.assertEqual(m.relevant("Jaguar XF Sedan LWB (X260) China", "", "Jaguar", "XF", "2023", ""), (False, "unmatched"))
        self.assertEqual(m.relevant("2019 Peugeot 208 GT-Line Genf show", "", "Peugeot", "208", "2019", ""), (True, "model_family"))

    def test_dedupe_and_conflicting_body(self):
        rows = [
            {"marca": "Kia", "modelo": "Cerato EX 1.6L AT", "anio": "2022", "carroceria": "Sedan"},
            {"marca": "Kia", "modelo": "Cerato GLX 1.6 MT", "anio": "2022", "carroceria": "Sedán"},
            {"marca": "Kia", "modelo": "Cerato CVT 1.6L", "anio": "2022", "carroceria": "Hatchback"},
        ]
        groups = m.groups_for(rows)
        self.assertEqual(len(groups), 1)
        self.assertEqual(next(iter(groups.values()))["bodies"], {"sedan", "hatchback"})

    def test_manifest_and_audit(self):
        with tempfile.TemporaryDirectory() as d:
            out = m.blank("Ford Focus 2016")
            out.update({"match_level": "exact_year", "source": "wikimedia_commons"})
            m.save(Path(d), {"ford|focus|2016": out}, {"ford": 3})
            manifest = json.loads((Path(d) / "catalogo_fotos_abiertas.json").read_text("utf-8"))
            self.assertEqual(set(manifest["ford|focus|2016"]), {
                "query_used", "match_level", "image_url", "thumb_url", "source",
                "source_page_url", "author", "license", "license_url", "retrieved_at"})
            self.assertIn("3", (Path(d) / "auditoria_extraccion.csv").read_text("utf-8-sig"))

if __name__ == "__main__":
    unittest.main()
