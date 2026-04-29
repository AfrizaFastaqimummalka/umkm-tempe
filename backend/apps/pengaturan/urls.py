from django.urls import path, include
from .views import PengaturanListView, PengaturanDetailView, PengaturanUpdateView, TelegramSettingsView, TestTelegramView, TelegramSubscriberViewSet

from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'telegram-subscribers', TelegramSubscriberViewSet, basename='telegram-subscriber')

urlpatterns = [
    path('', include(router.urls)),
    path('pengaturan/', PengaturanListView.as_view(), name='pengaturan-list'),
    path('pengaturan/<int:pk>/', PengaturanDetailView.as_view(), name='pengaturan-detail'),
    path('pengaturan/update/<str:jenis>/', PengaturanUpdateView.as_view(), name='pengaturan-update'),
    path('pengaturan/telegram/', TelegramSettingsView.as_view(), name='telegram-settings'),
    path('pengaturan/telegram/test/', TestTelegramView.as_view(), name='telegram-test'),
]