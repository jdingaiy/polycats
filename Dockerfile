FROM python:3.12-slim-bookworm
WORKDIR /app
ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1 OMP_NUM_THREADS=4 \
    U2NET_HOME=/app/.cache/rembg PORT=8000
RUN apt-get update && apt-get install -y --no-install-recommends libgomp1 libstdc++6 ca-certificates \
    && rm -rf /var/lib/apt/lists/*
COPY requirements.txt ./
RUN --mount=type=secret,id=proxy_ca \
    if [ -f /run/secrets/proxy_ca ]; then export PIP_CERT=/run/secrets/proxy_ca; fi; \
    pip install --no-cache-dir -r requirements.txt
COPY scripts/prefetch_model.py ./scripts/prefetch_model.py
RUN --mount=type=secret,id=proxy_ca \
    if [ -f /run/secrets/proxy_ca ]; then export REQUESTS_CA_BUNDLE=/run/secrets/proxy_ca SSL_CERT_FILE=/run/secrets/proxy_ca; fi; \
    python scripts/prefetch_model.py
COPY index.html style.css app.js cat.js ./
COPY server ./server
RUN useradd --uid 10001 --create-home app && chown -R app:app /app
USER app
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:' + __import__('os').environ['PORT'] + '/api/health', timeout=4)"
CMD ["python", "server/serve.py"]
