from django.db import models
from django.contrib.auth.models import User


class Pemasok(models.Model):
    """Model untuk data pemasok/supplier."""

    nama_pemasok = models.CharField(max_length=200)
    alamat = models.TextField(blank=True)
    no_hp = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    catatan = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['nama_pemasok']
        verbose_name = 'Pemasok'
        verbose_name_plural = 'Pemasok'

    def __str__(self):
        return self.nama_pemasok