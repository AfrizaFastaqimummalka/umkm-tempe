from django.db import models
from django.contrib.auth.models import User


class Pelanggan(models.Model):
    """Model untuk menyimpan data pelanggan UMKM Tempe."""

    nama = models.CharField(max_length=100)
    no_hp = models.CharField(max_length=20, blank=True)
    alamat = models.TextField(blank=True)
    catatan = models.TextField(blank=True, help_text='Catatan tambahan tentang pelanggan')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['nama']
        verbose_name = 'Pelanggan'
        verbose_name_plural = 'Pelanggan'

    def __str__(self):
        return self.nama
