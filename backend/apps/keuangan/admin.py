from django.contrib import admin
from .models import Pemasukan, Pengeluaran

@admin.register(Pemasukan)
class PemasukanAdmin(admin.ModelAdmin):
    list_display = ['tanggal', 'jumlah', 'kategori', 'keterangan', 'created_at']
    list_filter = ['kategori', 'tanggal']
    search_fields = ['keterangan']

@admin.register(Pengeluaran)
class PengeluaranAdmin(admin.ModelAdmin):
    list_display = ['tanggal', 'jumlah', 'kategori', 'keterangan', 'created_at']
    list_filter = ['kategori', 'tanggal']
    search_fields = ['keterangan']
