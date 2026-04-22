import json
import logging

from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from .services import process_update

logger = logging.getLogger(__name__)


@csrf_exempt
@require_POST
def telegram_webhook(request):
    """
    POST /api/telegram/webhook/
    Endpoint yang menerima update dari Telegram.
    Daftarkan URL ini ke Telegram setelah deploy.
    """
    try:
        data = json.loads(request.body)
        logger.info(f"Telegram update received: {data.get('update_id')}")
        process_update(data)
    except json.JSONDecodeError:
        logger.error("Invalid JSON from Telegram")
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        logger.error(f"Error processing Telegram update: {e}", exc_info=True)
        # Tetap return 200 agar Telegram tidak retry terus-terusan
    return JsonResponse({'ok': True})


def set_webhook(request):
    """
    GET /api/telegram/set-webhook/
    Helper untuk mendaftarkan webhook ke Telegram (panggil sekali setelah deploy).
    Hanya bisa dipanggil oleh admin Django.
    """
    if not request.user.is_staff:
        return JsonResponse({'error': 'Forbidden'}, status=403)

    import requests as req
    token = settings.TELEGRAM_BOT_TOKEN
    if not token:
        return JsonResponse({'error': 'TELEGRAM_BOT_TOKEN belum diset di .env'}, status=400)

    webhook_url = request.build_absolute_uri('/api/telegram/webhook/')
    resp = req.post(
        f"https://api.telegram.org/bot{token}/setWebhook",
        json={'url': webhook_url},
        timeout=10,
    )
    return JsonResponse(resp.json())
