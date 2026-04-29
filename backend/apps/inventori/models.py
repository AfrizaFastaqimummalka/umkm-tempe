from django.db import models
from django.contrib.auth.models import User


class Inventori(models.Model):
    """Model untuk mengelola stok barang/material."""

    SATUAN_CHOICES = [
        ('kg', 'Kilogram'),
        ('ons', 'Ons'),
        ('pcs', 'Pieces'),
        ('pack', 'Pack'),
        ('zak', 'Zak'),
        ('liter', 'Liter'),
        ('unit', 'Unit'),
    ]

    JENIS_MOVEMENT_CHOICES = [
        ('masuk', 'Masuk'),
        ('keluar', 'Keluar'),
    ]

    nama_barang = models.CharField(max_length=200)
    jumlah_stok = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    satuan = models.CharField(max_length=20, choices=SATUAN_CHOICES, default='kg')
    tanggal_update = models.DateField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['nama_barang']
        verbose_name = 'Inventori'
        verbose_name_plural = 'Inventori'

    def __str__(self):
        return f"{self.nama_barang} ({self.jumlah_stok} {self.get_satuan_display()})"


class InventoriMovement(models.Model):
    """Model untuk melacak pergerakan stok (masuk/keluar)."""

    inventori = models.ForeignKey(Inventori, on_delete=models.CASCADE, related_name='movements')
    jenis = models.CharField(max_length=10, choices=Inventori.JENIS_MOVEMENT_CHOICES)
    jumlah = models.DecimalField(max_digits=15, decimal_places=2)
    keterangan = models.CharField(max_length=255, blank=True)
    tanggal = models.DateField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    class Meta:
        ordering = ['-tanggal', '-id']
        verbose_name = 'Pergerakan Stok'
        verbose_name_plural = 'Pergerakan Stok'

    def __str__(self):
        return f"{self.get_jenis_display()} - {self.inventori.nama_barang} ({self.jumlah})"