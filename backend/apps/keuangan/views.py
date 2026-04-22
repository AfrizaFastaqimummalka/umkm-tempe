from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Q
from django.utils import timezone
from datetime import date, timedelta

from .models import Pemasukan, Pengeluaran
from .serializers import PemasukanSerializer, PengeluaranSerializer


class PemasukanViewSet(viewsets.ModelViewSet):
    """
    CRUD untuk Pemasukan.
    GET  /api/pemasukan/          → list semua
    POST /api/pemasukan/          → tambah baru
    GET  /api/pemasukan/{id}/     → detail
    PUT  /api/pemasukan/{id}/     → update penuh
    PATCH /api/pemasukan/{id}/    → update sebagian
    DELETE /api/pemasukan/{id}/   → hapus
    """
    serializer_class = PemasukanSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Pemasukan.objects.all()

        # Filter by tanggal
        tanggal_mulai = self.request.query_params.get('tanggal_mulai')
        tanggal_akhir = self.request.query_params.get('tanggal_akhir')
        bulan = self.request.query_params.get('bulan')
        tahun = self.request.query_params.get('tahun')

        if tanggal_mulai:
            queryset = queryset.filter(tanggal__gte=tanggal_mulai)
        if tanggal_akhir:
            queryset = queryset.filter(tanggal__lte=tanggal_akhir)
        if bulan:
            queryset = queryset.filter(tanggal__month=bulan)
        if tahun:
            queryset = queryset.filter(tanggal__year=tahun)

        return queryset


class PengeluaranViewSet(viewsets.ModelViewSet):
    """
    CRUD untuk Pengeluaran.
    """
    serializer_class = PengeluaranSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Pengeluaran.objects.all()

        tanggal_mulai = self.request.query_params.get('tanggal_mulai')
        tanggal_akhir = self.request.query_params.get('tanggal_akhir')
        bulan = self.request.query_params.get('bulan')
        tahun = self.request.query_params.get('tahun')

        if tanggal_mulai:
            queryset = queryset.filter(tanggal__gte=tanggal_mulai)
        if tanggal_akhir:
            queryset = queryset.filter(tanggal__lte=tanggal_akhir)
        if bulan:
            queryset = queryset.filter(tanggal__month=bulan)
        if tahun:
            queryset = queryset.filter(tanggal__year=tahun)

        return queryset


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_summary(request):
    """
    GET /api/dashboard/
    Mengembalikan ringkasan keuangan: total pemasukan, pengeluaran, saldo.
    Support filter: ?periode=hari|bulan|tahun
    """
    periode = request.query_params.get('periode', 'bulan')
    today = date.today()

    if periode == 'hari':
        filter_q = Q(tanggal=today)
        label = f"Hari ini ({today.strftime('%d %b %Y')})"
    elif periode == 'tahun':
        filter_q = Q(tanggal__year=today.year)
        label = f"Tahun {today.year}"
    else:  # default: bulan
        filter_q = Q(tanggal__year=today.year, tanggal__month=today.month)
        label = f"Bulan {today.strftime('%B %Y')}"

    total_pemasukan = Pemasukan.objects.filter(filter_q).aggregate(
        total=Sum('jumlah')
    )['total'] or 0

    total_pengeluaran = Pengeluaran.objects.filter(filter_q).aggregate(
        total=Sum('jumlah')
    )['total'] or 0

    saldo = total_pemasukan - total_pengeluaran

    # Data 7 hari terakhir untuk mini chart
    last_7 = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        masuk = Pemasukan.objects.filter(tanggal=d).aggregate(t=Sum('jumlah'))['t'] or 0
        keluar = Pengeluaran.objects.filter(tanggal=d).aggregate(t=Sum('jumlah'))['t'] or 0
        last_7.append({
            'tanggal': d.strftime('%d/%m'),
            'pemasukan': float(masuk),
            'pengeluaran': float(keluar),
        })

    return Response({
        'label': label,
        'total_pemasukan': float(total_pemasukan),
        'total_pengeluaran': float(total_pengeluaran),
        'saldo': float(saldo),
        'last_7_days': last_7,
    })
