from django.db import models
from django.contrib.auth.models import User


class Pemasukan(models.Model):
    """Model untuk mencatat pemasukan / pendapatan usaha tempe."""

    KATEGORI_CHOICES = [
        ('penjualan', 'Penjualan Tempe'),
        ('titip_jual', 'Titip Jual'),
        ('lainnya', 'Lainnya'),
    ]

    tanggal = models.DateField()
    jumlah = models.DecimalField(max_digits=15, decimal_places=0)
    keterangan = models.CharField(max_length=255, blank=True)
    kategori = models.CharField(max_length=20, choices=KATEGORI_CHOICES, default='penjualan')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-tanggal', '-created_at']
        verbose_name = 'Pemasukan'
        verbose_name_plural = 'Pemasukan'

    def __str__(self):
        return f"Pemasukan {self.tanggal} — Rp {self.jumlah:,.0f}"


class Pengeluaran(models.Model):
    """Model untuk mencatat pengeluaran / biaya usaha tempe."""

    KATEGORI_CHOICES = [
        ('bahan_baku', 'Bahan Baku'),
        ('operasional', 'Operasional'),
        ('gaji', 'Gaji Karyawan'),
        ('listrik_air', 'Listrik & Air'),
        ('lainnya', 'Lainnya'),
    ]

    tanggal = models.DateField()
    jumlah = models.DecimalField(max_digits=15, decimal_places=0)
    keterangan = models.CharField(max_length=255, blank=True)
    kategori = models.CharField(max_length=20, choices=KATEGORI_CHOICES, default='operasional')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-tanggal', '-created_at']
        verbose_name = 'Pengeluaran'
        verbose_name_plural = 'Pengeluaran'

    def __str__(self):
        return f"Pengeluaran {self.tanggal} — Rp {self.jumlah:,.0f}"
