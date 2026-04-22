import io
from datetime import date, timedelta
from decimal import Decimal

from django.db.models import Sum
from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

import openpyxl
from openpyxl.styles import (
    Font, PatternFill, Alignment, Border, Side, numbers
)
from openpyxl.utils import get_column_letter

from apps.keuangan.models import Pemasukan, Pengeluaran


# ─────────────────────────────────────────────────────────
# HELPER: Ambil data laporan dalam range tanggal
# ─────────────────────────────────────────────────────────

def get_laporan_data(tanggal_mulai, tanggal_akhir):
    pemasukan_qs = Pemasukan.objects.filter(
        tanggal__gte=tanggal_mulai,
        tanggal__lte=tanggal_akhir
    ).order_by('tanggal')

    pengeluaran_qs = Pengeluaran.objects.filter(
        tanggal__gte=tanggal_mulai,
        tanggal__lte=tanggal_akhir
    ).order_by('tanggal')

    total_pemasukan = pemasukan_qs.aggregate(t=Sum('jumlah'))['t'] or Decimal('0')
    total_pengeluaran = pengeluaran_qs.aggregate(t=Sum('jumlah'))['t'] or Decimal('0')
    saldo = total_pemasukan - total_pengeluaran

    return {
        'tanggal_mulai': tanggal_mulai,
        'tanggal_akhir': tanggal_akhir,
        'pemasukan': list(pemasukan_qs.values(
            'id', 'tanggal', 'jumlah', 'keterangan', 'kategori'
        )),
        'pengeluaran': list(pengeluaran_qs.values(
            'id', 'tanggal', 'jumlah', 'keterangan', 'kategori'
        )),
        'total_pemasukan': float(total_pemasukan),
        'total_pengeluaran': float(total_pengeluaran),
        'saldo': float(saldo),
    }


# ─────────────────────────────────────────────────────────
# LAPORAN ENDPOINTS
# ─────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def laporan_harian(request):
    """GET /api/laporan/harian/?tanggal=YYYY-MM-DD"""
    tanggal_str = request.query_params.get('tanggal')
    if tanggal_str:
        try:
            tanggal = date.fromisoformat(tanggal_str)
        except ValueError:
            return Response({'error': 'Format tanggal salah. Gunakan YYYY-MM-DD'}, status=400)
    else:
        tanggal = date.today()

    data = get_laporan_data(tanggal, tanggal)
    data['tipe'] = 'harian'
    data['label'] = tanggal.strftime('%d %B %Y')
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def laporan_bulanan(request):
    """GET /api/laporan/bulanan/?bulan=1&tahun=2025"""
    today = date.today()
    bulan = int(request.query_params.get('bulan', today.month))
    tahun = int(request.query_params.get('tahun', today.year))

    from calendar import monthrange
    _, hari_terakhir = monthrange(tahun, bulan)
    tanggal_mulai = date(tahun, bulan, 1)
    tanggal_akhir = date(tahun, bulan, hari_terakhir)

    data = get_laporan_data(tanggal_mulai, tanggal_akhir)
    data['tipe'] = 'bulanan'
    data['label'] = tanggal_mulai.strftime('%B %Y')
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def laporan_tahunan(request):
    """GET /api/laporan/tahunan/?tahun=2025"""
    today = date.today()
    tahun = int(request.query_params.get('tahun', today.year))

    tanggal_mulai = date(tahun, 1, 1)
    tanggal_akhir = date(tahun, 12, 31)

    data = get_laporan_data(tanggal_mulai, tanggal_akhir)
    data['tipe'] = 'tahunan'
    data['label'] = f'Tahun {tahun}'
    return Response(data)


# ─────────────────────────────────────────────────────────
# EXCEL EXPORT — generate_excel() helper
# ─────────────────────────────────────────────────────────

def generate_excel(data: dict) -> bytes:
    """
    Generate file Excel (.xlsx) dari data laporan.
    Mengembalikan bytes yang siap dikirim sebagai response atau Telegram file.
    """
    wb = openpyxl.Workbook()
    wb.remove(wb.active)  # hapus sheet default

    # ── Warna & Style ────────────────────────────
    COLOR_GREEN  = '1D9E75'
    COLOR_RED    = 'E24B4A'
    COLOR_HEADER = '0F6E56'
    COLOR_TITLE  = '063B2C'
    COLOR_LIGHT  = 'E8F8F2'
    COLOR_ALT    = 'F5FDFB'

    thin_border = Border(
        left=Side(style='thin', color='CCCCCC'),
        right=Side(style='thin', color='CCCCCC'),
        top=Side(style='thin', color='CCCCCC'),
        bottom=Side(style='thin', color='CCCCCC'),
    )

    def header_style(cell, bg=COLOR_HEADER):
        cell.font = Font(bold=True, color='FFFFFF', size=11)
        cell.fill = PatternFill('solid', fgColor=bg)
        cell.alignment = Alignment(horizontal='center', vertical='center')
        cell.border = thin_border

    def data_style(cell, align='left', bg=None):
        cell.font = Font(size=10)
        cell.alignment = Alignment(horizontal=align, vertical='center')
        cell.border = thin_border
        if bg:
            cell.fill = PatternFill('solid', fgColor=bg)

    def rupiah(val):
        return f"Rp {int(val):,}".replace(',', '.')

    label = data.get('label', 'Laporan')

    # ════════════════════════════════════════════
    # SHEET 1: RINGKASAN
    # ════════════════════════════════════════════
    ws = wb.create_sheet('Ringkasan')
    ws.sheet_view.showGridLines = False
    ws.column_dimensions['A'].width = 4
    ws.column_dimensions['B'].width = 30
    ws.column_dimensions['C'].width = 25
    ws.column_dimensions['D'].width = 4

    # Title
    ws.merge_cells('B2:C2')
    title_cell = ws['B2']
    title_cell.value = f'LAPORAN KEUANGAN UMKM TEMPE'
    title_cell.font = Font(bold=True, size=14, color=COLOR_TITLE)
    title_cell.alignment = Alignment(horizontal='center')

    ws.merge_cells('B3:C3')
    sub_cell = ws['B3']
    sub_cell.value = label
    sub_cell.font = Font(size=11, color='555555')
    sub_cell.alignment = Alignment(horizontal='center')

    # Summary box
    summary_rows = [
        ('Total Pemasukan', data['total_pemasukan'], COLOR_GREEN),
        ('Total Pengeluaran', data['total_pengeluaran'], COLOR_RED),
        ('Saldo Bersih', data['saldo'], COLOR_HEADER),
    ]
    for i, (label_txt, val, color) in enumerate(summary_rows, start=5):
        row = i + 1
        ws[f'B{row}'] = label_txt
        ws[f'B{row}'].font = Font(bold=True, size=11)
        ws[f'B{row}'].fill = PatternFill('solid', fgColor=COLOR_LIGHT)
        ws[f'B{row}'].border = thin_border
        ws[f'B{row}'].alignment = Alignment(vertical='center')

        ws[f'C{row}'] = rupiah(val)
        ws[f'C{row}'].font = Font(bold=True, size=11, color=color)
        ws[f'C{row}'].fill = PatternFill('solid', fgColor=COLOR_LIGHT)
        ws[f'C{row}'].border = thin_border
        ws[f'C{row}'].alignment = Alignment(horizontal='right', vertical='center')
        ws.row_dimensions[row].height = 28

    ws.row_dimensions[2].height = 32
    ws.row_dimensions[3].height = 22

    # ════════════════════════════════════════════
    # SHEET 2: PEMASUKAN
    # ════════════════════════════════════════════
    ws2 = wb.create_sheet('Pemasukan')
    ws2.sheet_view.showGridLines = False

    headers = ['No', 'Tanggal', 'Kategori', 'Keterangan', 'Jumlah (Rp)']
    col_widths = [6, 16, 18, 40, 20]
    for col, (h, w) in enumerate(zip(headers, col_widths), start=1):
        cell = ws2.cell(row=1, column=col, value=h)
        header_style(cell, COLOR_HEADER)
        ws2.column_dimensions[get_column_letter(col)].width = w
    ws2.row_dimensions[1].height = 24

    pemasukan_list = data.get('pemasukan', [])
    for i, item in enumerate(pemasukan_list, start=1):
        row = i + 1
        bg = COLOR_ALT if i % 2 == 0 else None
        cells = [
            (i, 'center'),
            (str(item['tanggal']), 'center'),
            (item.get('kategori', '').replace('_', ' ').title(), 'left'),
            (item.get('keterangan', '-'), 'left'),
            (int(item['jumlah']), 'right'),
        ]
        for col, (val, align) in enumerate(cells, start=1):
            cell = ws2.cell(row=row, column=col, value=val)
            data_style(cell, align, bg)
            if col == 5:
                cell.number_format = '#,##0'
        ws2.row_dimensions[row].height = 20

    # Total row
    total_row = len(pemasukan_list) + 2
    ws2.merge_cells(f'A{total_row}:D{total_row}')
    tc = ws2[f'A{total_row}']
    tc.value = 'TOTAL'
    tc.font = Font(bold=True, color='FFFFFF')
    tc.fill = PatternFill('solid', fgColor=COLOR_HEADER)
    tc.alignment = Alignment(horizontal='right', vertical='center')
    tc.border = thin_border

    tv = ws2.cell(row=total_row, column=5, value=int(data['total_pemasukan']))
    tv.font = Font(bold=True, color='FFFFFF')
    tv.fill = PatternFill('solid', fgColor=COLOR_HEADER)
    tv.alignment = Alignment(horizontal='right', vertical='center')
    tv.border = thin_border
    tv.number_format = '#,##0'
    ws2.row_dimensions[total_row].height = 24

    # ════════════════════════════════════════════
    # SHEET 3: PENGELUARAN
    # ════════════════════════════════════════════
    ws3 = wb.create_sheet('Pengeluaran')
    ws3.sheet_view.showGridLines = False

    for col, (h, w) in enumerate(zip(headers, col_widths), start=1):
        cell = ws3.cell(row=1, column=col, value=h)
        header_style(cell, '8B1A1A')
        ws3.column_dimensions[get_column_letter(col)].width = w
    ws3.row_dimensions[1].height = 24

    pengeluaran_list = data.get('pengeluaran', [])
    for i, item in enumerate(pengeluaran_list, start=1):
        row = i + 1
        bg = 'FFF5F5' if i % 2 == 0 else None
        cells = [
            (i, 'center'),
            (str(item['tanggal']), 'center'),
            (item.get('kategori', '').replace('_', ' ').title(), 'left'),
            (item.get('keterangan', '-'), 'left'),
            (int(item['jumlah']), 'right'),
        ]
        for col, (val, align) in enumerate(cells, start=1):
            cell = ws3.cell(row=row, column=col, value=val)
            data_style(cell, align, bg)
            if col == 5:
                cell.number_format = '#,##0'
        ws3.row_dimensions[row].height = 20

    total_row = len(pengeluaran_list) + 2
    ws3.merge_cells(f'A{total_row}:D{total_row}')
    tc = ws3[f'A{total_row}']
    tc.value = 'TOTAL'
    tc.font = Font(bold=True, color='FFFFFF')
    tc.fill = PatternFill('solid', fgColor='8B1A1A')
    tc.alignment = Alignment(horizontal='right', vertical='center')
    tc.border = thin_border

    tv = ws3.cell(row=total_row, column=5, value=int(data['total_pengeluaran']))
    tv.font = Font(bold=True, color='FFFFFF')
    tv.fill = PatternFill('solid', fgColor='8B1A1A')
    tv.alignment = Alignment(horizontal='right', vertical='center')
    tv.border = thin_border
    tv.number_format = '#,##0'
    ws3.row_dimensions[total_row].height = 24

    # Simpan ke bytes
    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return buffer.getvalue()


# ─────────────────────────────────────────────────────────
# EXPORT ENDPOINT
# ─────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_excel(request):
    """
    GET /api/laporan/export/?tipe=harian|bulanan|tahunan&tanggal=...&bulan=...&tahun=...
    Download file Excel laporan keuangan.
    """
    tipe = request.query_params.get('tipe', 'bulanan')
    today = date.today()

    if tipe == 'harian':
        tanggal_str = request.query_params.get('tanggal', today.isoformat())
        try:
            tanggal = date.fromisoformat(tanggal_str)
        except ValueError:
            return Response({'error': 'Format tanggal salah'}, status=400)
        data = get_laporan_data(tanggal, tanggal)
        data['label'] = tanggal.strftime('%d %B %Y')
        filename = f"laporan_harian_{tanggal.strftime('%Y%m%d')}.xlsx"

    elif tipe == 'tahunan':
        tahun = int(request.query_params.get('tahun', today.year))
        data = get_laporan_data(date(tahun, 1, 1), date(tahun, 12, 31))
        data['label'] = f'Tahun {tahun}'
        filename = f"laporan_tahunan_{tahun}.xlsx"

    else:  # bulanan (default)
        from calendar import monthrange
        bulan = int(request.query_params.get('bulan', today.month))
        tahun = int(request.query_params.get('tahun', today.year))
        _, hari_terakhir = monthrange(tahun, bulan)
        data = get_laporan_data(date(tahun, bulan, 1), date(tahun, bulan, hari_terakhir))
        data['label'] = date(tahun, bulan, 1).strftime('%B %Y')
        filename = f"laporan_bulanan_{tahun}{bulan:02d}.xlsx"

    excel_bytes = generate_excel(data)

    response = HttpResponse(
        excel_bytes,
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response


@api_view(['GET'])
@permission_classes([AllowAny])
def export_excel_internal(request):
    """
    Endpoint khusus untuk Telegram Bot (tanpa auth browser).
    Diproteksi dengan secret token di query param.
    GET /api/laporan/export/internal/?token=SECRET&tipe=bulanan
    """
    from django.conf import settings
    token = request.query_params.get('token', '')
    if token != getattr(settings, 'TELEGRAM_BOT_TOKEN', ''):
        return Response({'error': 'Unauthorized'}, status=401)

    # Reuse logic yang sama
    return export_excel(request._request)
