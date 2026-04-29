from django.contrib import admin
from .models import Inventori, InventoriMovement


@admin.register(Inventori)
class InventoriAdmin(admin.ModelAdmin):
    list_display = ('nama_barang', 'jumlah_stok', 'satuan', 'tanggal_update')
    search_fields = ('nama_barang',)
    list_filter = ('satuan',)


@admin.register(InventoriMovement)
class InventoriMovementAdmin(admin.ModelAdmin):
    list_display = ('inventori', 'jenis', 'jumlah', 'tanggal', 'keterangan')
    list_filter = ('jenis', 'tanggal')
    search_fields = ('inventori__nama_barang', 'keterangan')