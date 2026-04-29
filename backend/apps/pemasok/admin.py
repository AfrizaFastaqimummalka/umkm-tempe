from django.contrib import admin
from .models import Pemasok


@admin.register(Pemasok)
class PemasokAdmin(admin.ModelAdmin):
    list_display = ('nama_pemasok', 'no_hp', 'alamat')
    search_fields = ('nama_pemasok', 'no_hp', 'alamat')