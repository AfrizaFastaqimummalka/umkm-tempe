from django.db import models
from django.contrib.auth.models import User


class Pengaturan(models.Model):
    """Model untuk menyimpan pengaturan aplikasi."""

    JENIS_PENGATURAN_CHOICES = [
        ('telegram', 'Telegram'),
        ('notifikasi', 'Notifikasi'),
        ('aplikasi', 'Aplikasi'),
    ]

    nama_pengaturan = models.CharField(max_length=100)
    jenis = models.CharField(max_length=20, choices=JENIS_PENGATURAN_CHOICES)
    nilai = models.TextField(blank=True)
    deskripsi = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Pengaturan'
        verbose_name_plural = 'Pengaturan'
        unique_together = ['nama_pengaturan', 'jenis']

    def __str__(self):
        return f"{self.jenis} - {self.nama_pengaturan}"

    @classmethod
    def get(cls, jenis, nama, default=None):
        """Ambil nilai pengaturan."""
        try:
            obj = cls.objects.get(jenis=jenis, nama_pengaturan=nama, is_active=True)
            return obj.nilai
        except cls.DoesNotExist:
            return default

    @classmethod
    def set(cls, jenis, nama, nilai, deskripsi='', created_by=None):
        """Simpan atau update pengaturan."""
        obj, created = cls.objects.update_or_create(
            jenis=jenis,
            nama_pengaturan=nama,
            defaults={'nilai': nilai, 'deskripsi': deskripsi, 'created_by': created_by}
        )
        return obj

import string
import random

def generate_verification_code():
    """Generate 6 karakter random alphanumeric"""
    return ''.join(random.choices(string.ascii_letters + string.digits, k=6)).upper()

class TelegramSubscriber(models.Model):
    """Model untuk mendata admin yang menerima notifikasi Telegram."""
    
    nama = models.CharField(max_length=100)
    nomor_hp = models.CharField(max_length=20, blank=True)
    telegram_chat_id = models.CharField(max_length=50, blank=True, null=True)
    telegram_verified = models.BooleanField(default=False)
    verification_code = models.CharField(max_length=20, unique=True, default=generate_verification_code)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Telegram Subscriber'
        verbose_name_plural = 'Telegram Subscribers'

    def __str__(self):
        status = "Verified" if self.telegram_verified else "Pending"
        return f"{self.nama} ({status})"