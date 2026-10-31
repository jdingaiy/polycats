"""Download official weights during image construction, retaining rembg's checksum verification."""
from rembg.sessions.birefnet_general_lite import BiRefNetSessionGeneralLite
BiRefNetSessionGeneralLite.download_models()
