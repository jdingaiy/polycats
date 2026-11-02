# GitHub Pages 免费部署

当前网页在浏览器中完成抠图，无需 Render 或图片处理后端。

1. 仓库 Settings → Pages，Source 选择 GitHub Actions。
2. 推送 main 或手动运行 Actions → Publish Polycats to GitHub Pages。
3. 等工作流部署成功后访问 https://jdingaiy.github.io/polycats/ 。

工作流运行 `npm ci`、`npm test`、`npm run build:pages`，发布整个 `dist/`。构建会从 rembg 官方 GitHub release 下载约 4.6 MB 的 u2netp.onnx，核验官方 MD5 校验值；下载缓存位于 `.cache/browser-model`。WASM 与运行库来自锁定版本的 npm 依赖。

必须一起发布 `dist/assets/`，其中包含模型、WASM、运行库和后台线程。首次导入普通照片会加载模型和运行库；照片留在浏览器，不发送给远程推理服务。透明 PNG 不需要模型。网页使用单线程 WASM，不要求 COOP/COEP，兼容 Pages 子路径部署。

原有 `POLYCATS_API_BASE` GitHub Actions 变量不再使用，可删除。无需配置 `ALLOWED_ORIGINS`，也无需启动 Render 服务。若已经创建付费 Render 服务，可以在 Render 中停止或删除以免继续计费；本次代码修改不会自动取消订阅。

本地开发：Node 24、Python 3，运行 `npm ci`、`npm start`。服务默认绑定 127.0.0.1:8000，可用 `npm start -- --host 127.0.0.1 --port 8001` 更改。只需静态服务，不需要安装 Python 图片处理依赖。

旧 Dockerfile / Python 服务保留作独立实验，不是目前的部署入口。轻量模型的复杂背景效果可能弱于旧 BiRefNet Lite；HEIC 仅在浏览器能够解码时可用，否则需先转换成 JPG。
