"""Offline tests for safe bulk Commons/Openverse photo discovery."""
import csv
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT=Path(__file__).resolve().parents[1]
def load(fname,slug):
 spec=importlib.util.spec_from_file_location(slug,ROOT/fname)
 module=importlib.util.module_from_spec(spec)
 spec.loader.exec_module(module)
 return module
q=load("rindelab-photo-fast-queue.py","queue")
f=load("rindelab-photo-fast-fetch.py","fetch")

class FastPhotoTests(unittest.TestCase):
 def test_body_type_not_inferred_from_door_counts(self):
  self.assertEqual(q.body_type("Forester Station Wagon 5P."),"suv_or_wagon")
  self.assertEqual(q.body_type("Rexton Station Wagon 4P."),"suv_or_wagon")
  self.assertEqual(q.body_type("Focus Hatchback 5P."),"hatchback")
  self.assertEqual(q.body_type("Cerato Sedan 4P."),"sedan")
  self.assertEqual(q.body_type("Transit Furgón escolar 21 Asientos"),"minibus")
  self.assertEqual(q.body_type("BMW 430i Grand Coupé"),"coupe")
  self.assertEqual(q.body_type("Ford F150 Doble Cabina 4P."),"pickup")

 def test_distinct_family_identity(self):
  self.assertEqual(q.family("Mercedes-Benz","C 200 2.0 Sedan"),"C-Class")
  self.assertEqual(q.family("BMW","118d 2,0 Lts. Hatchback 5P."),"1 Series")
  self.assertEqual(q.family("Jaguar","E-Pace 2.0i R-Dynamic"),"E PACE")
  self.assertEqual(q.family("Jaguar","I-Pace EV400"),"I PACE")
  self.assertEqual(q.family("Jeep","Grand Cherokee L Limited"),"GRAND CHEROKEE L")
  self.assertEqual(q.family("Jeep","Grand Cherokee Limited"),"GRAND CHEROKEE")
  self.assertEqual(q.family("Kia","Cerato 5 EX 1.6L"),"CERATO 5")
  self.assertEqual(q.family("Kia","Cerato EX 1.6L"),"CERATO")
  self.assertEqual(q.family("Hyundai","New Tucson LM 2,0 Lts."),"TUCSON LM")

 def test_clusters_never_autopublish(self):
  rows=[
   {"marca":"Ford","modelo":"Ranger XL 2.0 AT","anio":"2024"},
   {"marca":"Ford","modelo":"Ranger XLT 2.0 MT","anio":"2024"},
   {"marca":"Ford","modelo":"Ranger Raptor 3.0 AT","anio":"2024"},
   {"marca":"Ford","modelo":"Ranger Raptor 3.0 AT","anio":"2022"},
  ]
  groups=q.build(rows)
  self.assertEqual(len(groups),2)
  self.assertEqual(sorted(g["fichas"] for g in groups),[2,2])
  self.assertTrue(all(g["estado"]=="pendiente_revision_generacion" and not g["imagen_url"] for g in groups))

 def test_save_review_queue_fields(self):
  with tempfile.TemporaryDirectory() as d:
   r=f.source.blank("Ford Ranger 2024")
   r.update(cluster_key="ford|ranger|2022-2026|pickup",
     brand="Ford",family="Ranger",cohort="2022-2026",body="pickup",
     candidate_fichas=12,sample_versions="Ranger XL",requires_visual_review=True,
     requires_generation_review=True,license_rejections=0,errors=[])
   f.save(Path(d),{"a":r})
   self.assertTrue((Path(d)/"candidatos_masivos.json").exists())
   x=json.loads((Path(d)/"candidatos_masivos.json").read_text("utf-8"))
   self.assertTrue(x["a"]["requires_visual_review"])
   self.assertIsNone(x["a"]["image_url"])
   self.assertIn("sin_coincidencia",(Path(d)/"auditoria_masiva.csv").read_text("utf-8-sig"))
 def test_brand_specific_family_guards(self):
  self.assertEqual(q.family("Chery","Tiggo 2 Pro 1.5 MT"),"TIGGO 2")
  self.assertEqual(q.family("Chery","Tiggo 8 Pro 1.6 DCT"),"TIGGO 8")
  self.assertEqual(q.family("Mini","Cooper S Countryman All4"),"COUNTRYMAN")
  self.assertEqual(q.family("BMW","118d 2.0 Hatchback"),"1 Series")

if __name__=="__main__":unittest.main()
