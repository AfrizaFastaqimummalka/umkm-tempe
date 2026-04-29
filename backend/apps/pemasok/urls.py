from django.urls import path
from .views import PemasokListCreateView, PemasokDetailView

urlpatterns = [
    path('', PemasokListCreateView.as_view(), name='pemasok-list'),
    path('<int:pk>/', PemasokDetailView.as_view(), name='pemasok-detail'),
]