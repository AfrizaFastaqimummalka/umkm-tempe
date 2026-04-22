from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PemasukanViewSet, PengeluaranViewSet, dashboard_summary

router = DefaultRouter()
router.register(r'pemasukan', PemasukanViewSet, basename='pemasukan')
router.register(r'pengeluaran', PengeluaranViewSet, basename='pengeluaran')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', dashboard_summary, name='dashboard'),
]
