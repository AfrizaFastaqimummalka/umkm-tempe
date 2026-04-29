from django.urls import path
from .views import (
    InventoriListCreateView,
    InventoriDetailView,
    InventoriMovementListCreateView,
    InventoriMovementListView,
)

urlpatterns = [
    path('', InventoriListCreateView.as_view(), name='inventori-list'),
    path('<int:pk>/', InventoriDetailView.as_view(), name='inventori-detail'),
    path('movements/', InventoriMovementListCreateView.as_view(), name='movement-list'),
    path('movements/<int:inventori_id>/', InventoriMovementListView.as_view(), name='movement-list-by-inventori'),
]