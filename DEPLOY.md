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

## 给 GitHub Pages 连接后端：Render 操作步骤

1. 登录 Render，选择 **New → Web Service**，连接 GitHub 的 `jdingaiy/polycats` 仓库。
2. 分支选择 **main**，运行环境选择 **Docker**；Dockerfile 使用仓库根目录的 `Dockerfile`，不需要另外填写 Python Build/Start Command。
3. 选择可容纳模型的实例；建议先用 **4 GB 内存**，根据实际峰值调整。此规格通常收费，请以 Render 页面显示的价格为准。
4. 设置环境变量 `ALLOWED_ORIGINS` 为 `https://jdingaiy.github.io`。这里必须是网页的源，不要添加 `/polycats/` 路径。`PORT` 由平台提供，代码会读取它。
5. Health Check Path 填 **`/api/health`**，创建并等待服务构建成功。构建会校验并下载模型权重。
6. 复制 Render 提供的 HTTPS 服务地址，形如 `https://polycats-api-xxxx.onrender.com`。访问其 `/api/health` 应返回 `{"ok": true}`。
7. 在 GitHub 仓库的 **Settings → Secrets and variables → Actions → Variables → New repository variable** 中添加变量：名字 **`POLYCATS_API_BASE`**，值为刚才复制的 HTTPS 服务地址，不要追加 `/api/segment`。
8. 回到 GitHub **Actions → Publish Polycats to GitHub Pages → Run workflow**，选择 main 并运行。等待绿色通过，再刷新 Pages 网站。
9. “图片导入待连接”会恢复为“导入图片”。选一张图片，验证生成轮廓与叠底开关。

代码已支持跨域预检，并且只允许 `ALLOWED_ORIGINS` 列出的源；不要填写 `*`。如果改用自定义前端域名，需要把其完整源也加入（多个用英文逗号分隔）。Render 创建项目、实例付费与 HTTPS 地址需要你在自己账号中完成；本仓库没有创建或部署任何 Render 服务。

手机交互：按钮按下时缩小并反色，松开/取消后复原；绘制模式保持选中反馈。触屏上的顶点只在实际拖动或绘制时显示，松手即隐藏，透明触摸区域仍可命中边缘与顶点。
