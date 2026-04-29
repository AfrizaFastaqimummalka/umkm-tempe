from django.contrib import admin
from .models import Pengaturan


@admin.register(Pengaturan)
class PengaturanAdmin(admin.ModelAdmin):
    list_display = ('nama_pengaturan', 'jenis', 'nilai', 'is_active', 'updated_at')
    list_filter = ('jenis', 'is_active')
    search_fields = ('nama_pengaturan', 'nilai')