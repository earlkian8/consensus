# ── Backend build ──────────────────────────────────────────────
FROM node:24-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --omit=dev
COPY backend/ .

# ── Final image ────────────────────────────────────────────────
FROM python:3.11-slim

# Install Node.js and supervisord
RUN apt-get update && apt-get install -y \
    curl gnupg supervisor libpq-dev gcc \
    && curl -fsSL https://deb.nodesource.com/setup_24.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Python model
WORKDIR /app/model
COPY model/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY model/ .

# Node backend
WORKDIR /app/backend
COPY --from=backend-build /app/backend .

# Supervisor config
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 5000 5001

CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
