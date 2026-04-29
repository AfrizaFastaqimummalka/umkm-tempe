from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import Inventori, InventoriMovement
from .serializers import InventoriSerializer, InventoriMovementSerializer


class InventoriViewSet(viewsets.ModelViewSet):
    """ViewSet untuk CRUD Inventori."""
    queryset = Inventori.objects.all()
    serializer_class = InventoriSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save()


class InventoriMovementViewSet(viewsets.ModelViewSet):
    """ViewSet untuk CRUD Pergerakan Stok."""
    queryset = InventoriMovement.objects.all()
    serializer_class = InventoriMovementSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        movement = serializer.save(created_by=self.request.user)
        # Update jumlah_stok di Inventori
        inventori = movement.inventori
        if movement.jenis == 'masuk':
            inventori.jumlah_stok += movement.jumlah
        else:  # keluar
            inventori.jumlah_stok -= movement.jumlah
        inventori.save()


# Separate views for URL routing
from rest_framework.views import APIView
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView, ListAPIView


class InventoriListCreateView(ListCreateAPIView):
    """List dan Create Inventori."""
    queryset = Inventori.objects.all()
    serializer_class = InventoriSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class InventoriDetailView(RetrieveUpdateDestroyAPIView):
    """Detail, Update, Delete Inventori."""
    queryset = Inventori.objects.all()
    serializer_class = InventoriSerializer
    permission_classes = [IsAuthenticated]


class InventoriMovementListCreateView(ListCreateAPIView):
    """List dan Create Pergerakan Stok."""
    queryset = InventoriMovement.objects.all()
    serializer_class = InventoriMovementSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        movement = serializer.save(created_by=self.request.user)
        inventori = movement.inventori
        if movement.jenis == 'masuk':
            inventori.jumlah_stok += movement.jumlah
        else:
            inventori.jumlah_stok -= movement.jumlah
        inventori.save()


class InventoriMovementListView(ListAPIView):
    """List Pergerakan Stok berdasarkan Inventori."""
    serializer_class = InventoriMovementSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        inventori_id = self.kwargs['inventori_id']
        return InventoriMovement.objects.filter(inventori_id=inventori_id)