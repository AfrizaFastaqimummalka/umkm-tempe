from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # ── Auth ──────────────────────────────────────
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # ── Keuangan (pemasukan + pengeluaran) ────────
    path('api/', include('apps.keuangan.urls')),

    # ── Pelanggan ─────────────────────────────────
    path('api/', include('apps.pelanggan.urls')),

    # ── Laporan + Export ──────────────────────────
    path('api/', include('apps.laporan.urls')),

    # ── Telegram Webhook ──────────────────────────
    path('api/', include('apps.telegram_bot.urls')),

    # ── Inventori (Stock Management) ──────────────
    path('api/inventori/', include('apps.inventori.urls')),

    # ── Pemasok (Supplier) ────────────────────────
    path('api/pemasok/', include('apps.pemasok.urls')),

    # ── Pengaturan (Settings) ─────────────────────
    path('api/', include('apps.pengaturan.urls')),
]
