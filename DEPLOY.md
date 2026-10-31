# Polycats service deployment

This app needs one Python CPU service serving both the frontend and `/api/segment`. Deploying only the HTML to static hosting does not provide image segmentation.

## Container

```sh
docker build -t polycats .
docker run --rm -p 8000:8000 -e PORT=8000 polycats
```

The image includes BiRefNet Lite weights downloaded from the official rembg release with its built-in checksum verification. Uploaded photos are processed in memory; they are not stored in the image or uploaded to a third-party inference service.

The process binds to `0.0.0.0` and reads the platform's `PORT` environment variable. Configure the host's health probe as `GET /api/health`. Allocate enough memory for the CPU model and image decoding; start with 4 GB and measure the host's actual usage. Use a single container process; it reuses one model instance. The first segmentation also includes model initialization.

HTTPS should terminate at the hosting platform. Route both the frontend and `/api/segment` to this service to preserve same-origin uploads. The proxy must allow a 32 MB upload and enough time for a cold-start segmentation request (at least 120 seconds is a sensible initial setting).

## Session proxy builds

In the managed cloud workspace, use the existing daemon's proxy settings. The combined CA bundle can be passed as a temporary build secret; it is not copied into the image:

```sh
docker build --secret id=proxy_ca,src=/etc/ssl/certs/ca-certificates.crt -t polycats .
```

## Publication status

These files prepare deployment; they do not publish a website. A target hosting project and authorized deployment access are still required. No domain, billing plan, or hosting account is inferred from the GitHub repository name.

## GitHub Pages

The repository includes `.github/workflows/pages.yml`. In the repository's **Settings → Pages**, select **GitHub Actions** as the source, then run the Pages workflow (or push `main`). It tests the renderer, builds a single-file static site, and uploads it to Pages.

`npm run build:pages` produces `dist/index.html`. This build deliberately disables image import until an image-processing backend is connected; the drawing, random shape, reroll and pose matching work entirely in the browser. GitHub Pages cannot run the Python segmentation model. A future separate backend must allow the Pages origin through CORS; its HTTPS base URL can then be supplied as `window.POLYCATS_API_BASE` before the app script.

For this repository, the expected project-site address after successful Pages deployment is `https://jdingaiy.github.io/polycats/`. That address is not evidence that publication has succeeded; confirm the workflow and the live page after enabling Pages.
