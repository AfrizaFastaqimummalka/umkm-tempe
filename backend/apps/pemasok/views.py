from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter

from .models import Pemasok
from .serializers import PemasokSerializer


class PemasokListCreateView(ListCreateAPIView):
    """List dan Create Pemasok."""
    queryset = Pemasok.objects.all()
    serializer_class = PemasokSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter]
    search_fields = ['nama_pemasok', 'alamat', 'no_hp']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class PemasokDetailView(RetrieveUpdateDestroyAPIView):
    """Detail, Update, Delete Pemasok."""
    queryset = Pemasok.objects.all()
    serializer_class = PemasokSerializer
    permission_classes = [IsAuthenticated]