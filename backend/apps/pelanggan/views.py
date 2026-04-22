from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Pelanggan
from .serializers import PelangganSerializer


class PelangganViewSet(viewsets.ModelViewSet):
    """
    CRUD untuk Pelanggan.
    GET    /api/pelanggan/        → list semua
    POST   /api/pelanggan/        → tambah baru
    GET    /api/pelanggan/{id}/   → detail
    PUT    /api/pelanggan/{id}/   → update
    DELETE /api/pelanggan/{id}/   → hapus
    """
    serializer_class = PelangganSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Pelanggan.objects.all()
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(nama__icontains=search)
        return queryset
