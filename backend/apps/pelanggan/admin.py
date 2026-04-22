from django.contrib import admin
from .models import Pelanggan

@admin.register(Pelanggan)
class PelangganAdmin(admin.ModelAdmin):
    list_display = ['nama', 'no_hp', 'alamat', 'created_at']
    search_fields = ['nama', 'no_hp', 'alamat']
