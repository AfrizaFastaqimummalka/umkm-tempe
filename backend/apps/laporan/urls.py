from django.urls import path
from .views import laporan_harian, laporan_bulanan, laporan_tahunan, export_excel, export_excel_internal

urlpatterns = [
    path('laporan/harian/', laporan_harian, name='laporan-harian'),
    path('laporan/bulanan/', laporan_bulanan, name='laporan-bulanan'),
    path('laporan/tahunan/', laporan_tahunan, name='laporan-tahunan'),
    path('laporan/export/', export_excel, name='export-excel'),
    path('laporan/export/internal/', export_excel_internal, name='export-excel-internal'),
]
