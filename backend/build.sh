#!/usr/bin/env bash
# Build script untuk Render.com
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate
