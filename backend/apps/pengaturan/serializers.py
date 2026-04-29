from rest_framework import serializers
from .models import Pengaturan


class PengaturanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pengaturan
        fields = ['id', 'nama_pengaturan', 'jenis', 'nilai', 'deskripsi', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class PengaturanTelegramSerializer(serializers.Serializer):
    """Serializer khusus untuk pengaturan Telegram."""
    bot_token = serializers.CharField(max_length=200, required=False, allow_blank=True)
    chat_id = serializers.CharField(max_length=50, required=False, allow_blank=True)
    notifications_enabled = serializers.BooleanField(required=False)


class PengaturanNotifikasiSerializer(serializers.Serializer):
    """Serializer untuk pengaturan notifikasi."""
    laporan_harian = serializers.BooleanField(required=False)
    laporan_bulanan = serializers.BooleanField(required=False)
    alert_stok_rendah = serializers.BooleanField(required=False)

from .models import TelegramSubscriber

class TelegramSubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model = TelegramSubscriber
        fields = ['id', 'nama', 'nomor_hp', 'telegram_chat_id', 'telegram_verified', 'verification_code', 'is_active', 'created_at']
        read_only_fields = ['id', 'telegram_chat_id', 'telegram_verified', 'verification_code', 'created_at']