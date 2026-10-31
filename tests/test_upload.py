import base64
import io
from pathlib import Path
import sys
import unittest
from unittest.mock import patch
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'server'))
import segment
from PIL import Image, ImageDraw
import numpy as np

class UploadTests(unittest.TestCase):
    def test_vertex_cap_and_overlay_share_one_transform(self):
        mask = Image.new('L', (300, 240))
        ImageDraw.Draw(mask).polygon([(25,120),(70,40),(140,20),(200,80),(270,110),(200,200),(120,180),(60,210)], fill=255)
        points, placement = segment.extract_outline(mask)
        self.assertGreaterEqual(len(points), 3)
        self.assertLessEqual(len(points), 15)
        scale = placement['width'] / mask.width
        self.assertAlmostEqual(scale, placement['height'] / mask.height)
        for x, y in points:
            image_x = (x-placement['x'])/scale
            image_y = (y-placement['y'])/scale
            self.assertTrue(-1<=image_x<=mask.width+1 and -1<=image_y<=mask.height+1)
        self.assertAlmostEqual((min(x for x,y in points)+max(x for x,y in points))/2,250,places=1)

    def test_transparent_image_needs_no_segmentation_and_keeps_original_underlay(self):
        image = Image.new('RGBA', (180,120))
        ImageDraw.Draw(image).rectangle((30,20,150,100), fill=(200,60,80,255))
        source = io.BytesIO(); image.save(source, 'PNG')
        with patch.object(segment, '_infer', side_effect=AssertionError('Should reuse alpha')):
            result = segment.process_image(source.getvalue())
        self.assertLessEqual(result['vertices'],15)
        saved = Image.open(io.BytesIO(base64.b64decode(result['image'].split(',')[1])))
        self.assertEqual(saved.size,image.size)
        np.testing.assert_array_equal(np.asarray(saved),np.asarray(image))

    def test_invalid_image_and_empty_subject_are_rejected(self):
        with self.assertRaises(ValueError): segment.process_image(b'not an image')
        with self.assertRaises(ValueError): segment.extract_outline(Image.new('L',(100,100)))

if __name__=='__main__': unittest.main()
