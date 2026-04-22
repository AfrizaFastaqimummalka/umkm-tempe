from django.urls import path
from .views import telegram_webhook, set_webhook

urlpatterns = [
    path('telegram/webhook/', telegram_webhook, name='telegram-webhook'),
    path('telegram/set-webhook/', set_webhook, name='telegram-set-webhook'),
]
