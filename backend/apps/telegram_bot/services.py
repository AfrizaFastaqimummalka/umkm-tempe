"""
Telegram Bot Service untuk UMKM Tempe.
Menangani command /rekap dan mengirim laporan otomatis.
"""

import requests
from datetime import date
from calendar import monthrange
from django.conf import settings

from apps.keuangan.models import Pemasukan, Pengeluaran
from apps.pengaturan.models import Pengaturan
from django.db.models import Sum
from decimal import Decimal


def get_telegram_config():
    """Ambil konfigurasi Telegram dari database atau settings."""
    # Coba ambil dari database dulu
    bot_token = Pengaturan.get('telegram', 'bot_token')
    chat_id = Pengaturan.get('telegram', 'chat_id')
    
    # Fallback ke settings jika tidak ada di database
    if not bot_token:
        bot_token = getattr(settings, 'TELEGRAM_BOT_TOKEN', None)
    if not chat_id:
        chat_id = getattr(settings, 'TELEGRAM_ALLOWED_CHAT_IDS', [None])[0]
    
    return bot_token, chat_id


def get_telegram_api():
    """Ambil API URL dengan token dinamis."""
    bot_token, _ = get_telegram_config()
    if not bot_token:
        return None
    return f"https://api.telegram.org/bot{bot_token}"


# Legacy: tetap gunakan settings untuk backward compatibility
TELEGRAM_API = f"https://api.telegram.org/bot{getattr(settings, 'TELEGRAM_BOT_TOKEN', '')}"


def send_message(chat_id: int, text: str, parse_mode: str = 'Markdown') -> dict:
    """Kirim pesan teks ke Telegram menggunakan konfigurasi dinamis."""
    telegram_api = get_telegram_api()
    if not telegram_api:
        return {'ok': False, 'error': 'Bot token not configured'}
    
    resp = requests.post(
        f"{telegram_api}/sendMessage",
        json={
            'chat_id': chat_id,
            'text': text,
            'parse_mode': parse_mode,
        },
        timeout=15,
    )
    return resp.json()


def send_document(chat_id: int, file_bytes: bytes, filename: str, caption: str = '') -> dict:
    """Kirim file ke Telegram menggunakan konfigurasi dinamis."""
    telegram_api = get_telegram_api()
    if not telegram_api:
        return {'ok': False, 'error': 'Bot token not configured'}
    
    resp = requests.post(
        f"{telegram_api}/sendDocument",
        data={
            'chat_id': chat_id,
            'caption': caption,
            'parse_mode': 'Markdown',
        },
        files={
            'document': (filename, file_bytes, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
        },
        timeout=30,
    )
    return resp.json()


def is_allowed_chat(chat_id: int) -> bool:
    """Cek apakah chat_id diizinkan mengakses bot."""
    # Cek dari TelegramSubscriber
    from apps.pengaturan.models import TelegramSubscriber
    if TelegramSubscriber.objects.filter(telegram_chat_id=str(chat_id), telegram_verified=True, is_active=True).exists():
        return True

    # Ambil dari database (legacy)
    _, chat_id_db = get_telegram_config()
    
    # Cek dari database
    if chat_id_db:
        return str(chat_id) == str(chat_id_db)
    
    # Fallback ke settings
    allowed = getattr(settings, 'TELEGRAM_ALLOWED_CHAT_IDS', [])
    if not allowed or allowed == ['']:
        return True  # Jika kosong, izinkan semua (untuk development)
    return str(chat_id) in [str(c) for c in allowed]

def format_rupiah(amount) -> str:
    """Format angka ke format Rupiah Indonesia."""
    return f"Rp {int(amount):,}".replace(',', '.')

def build_rekap_text(tipe: str = 'bulanan', tanggal_param=None) -> str:
    """
    Buat teks ringkasan laporan keuangan.
    tipe: 'harian' | 'bulanan' | 'tahunan'
    """
    today = date.today()

    if tipe == 'harian':
        tanggal = tanggal_param or today
        date_filter = {'tanggal': tanggal}
        label = tanggal.strftime('%d %B %Y')
    elif tipe == 'tahunan':
        tahun = tanggal_param or today.year
        date_filter = {'tanggal__year': tahun}
        label = f'Tahun {tahun}'
    else:  # bulanan
        bulan = today.month
        tahun = today.year
        if tanggal_param:
            bulan, tahun = tanggal_param
        date_filter = {'tanggal__month': bulan, 'tanggal__year': tahun}
        label = date(tahun, bulan, 1).strftime('%B %Y')

    total_masuk = Pemasukan.objects.filter(**date_filter).aggregate(
        t=Sum('jumlah')
    )['t'] or Decimal('0')

    total_keluar = Pengeluaran.objects.filter(**date_filter).aggregate(
        t=Sum('jumlah')
    )['t'] or Decimal('0')

    saldo = total_masuk - total_keluar
    status_icon = '✅' if saldo >= 0 else '⚠️'

    text = (
        f"📊 *REKAP KEUANGAN UMKM TEMPE*\n"
        f"📅 Periode: *{label}*\n"
        f"{'─' * 30}\n\n"
        f"💰 *Total Pemasukan*\n"
        f"   {format_rupiah(total_masuk)}\n\n"
        f"💸 *Total Pengeluaran*\n"
        f"   {format_rupiah(total_keluar)}\n\n"
        f"{'─' * 30}\n"
        f"{status_icon} *Saldo Bersih*\n"
        f"   *{format_rupiah(saldo)}*\n\n"
        f"_File Excel terlampir di bawah._"
    )
    return text, label

def handle_rekap_command(chat_id: int, args: list):
    """
    Handler untuk command /rekap
    Contoh penggunaan:
      /rekap              → rekap bulan ini
      /rekap harian       → rekap hari ini
      /rekap bulanan      → rekap bulan ini
      /rekap tahunan      → rekap tahun ini
    """
    from apps.laporan.views import get_laporan_data, generate_excel
    from calendar import monthrange

    today = date.today()
    tipe = 'bulanan'

    if args:
        arg = args[0].lower()
        if arg in ('harian', 'hari'):
            tipe = 'harian'
        elif arg in ('tahunan', 'tahun'):
            tipe = 'tahunan'

    # Kirim loading message dulu
    send_message(chat_id, "⏳ Sedang membuat laporan... Mohon tunggu sebentar.")

    try:
        # Tentukan range tanggal
        if tipe == 'harian':
            t_mulai = t_akhir = today
            label = today.strftime('%d %B %Y')
        elif tipe == 'tahunan':
            t_mulai = date(today.year, 1, 1)
            t_akhir = date(today.year, 12, 31)
            label = f'Tahun {today.year}'
        else:
            _, hari_akhir = monthrange(today.year, today.month)
            t_mulai = date(today.year, today.month, 1)
            t_akhir = date(today.year, today.month, hari_akhir)
            label = today.strftime('%B %Y')

        # Ambil data laporan
        data = get_laporan_data(t_mulai, t_akhir)
        data['label'] = label

        # Buat teks ringkasan
        total_masuk = data['total_pemasukan']
        total_keluar = data['total_pengeluaran']
        saldo = data['saldo']
        status_icon = '✅' if saldo >= 0 else '⚠️'

        text = (
            f"📊 *REKAP KEUANGAN UMKM TEMPE*\n"
            f"📅 Periode: *{label}*\n"
            f"{'─' * 28}\n\n"
            f"💰 *Total Pemasukan*\n"
            f"   `{format_rupiah(total_masuk)}`\n\n"
            f"💸 *Total Pengeluaran*\n"
            f"   `{format_rupiah(total_keluar)}`\n\n"
            f"{'─' * 28}\n"
            f"{status_icon} *Saldo Bersih:* `{format_rupiah(saldo)}`\n\n"
            f"_File Excel terlampir._"
        )

        # Generate Excel
        excel_bytes = generate_excel(data)
        filename = f"rekap_{tipe}_{today.strftime('%Y%m%d')}.xlsx"

        # Kirim dokumen + caption
        send_document(
            chat_id=chat_id,
            file_bytes=excel_bytes,
            filename=filename,
            caption=text,
        )

    except Exception as e:
        send_message(
            chat_id,
            f"❌ Gagal membuat laporan.\nError: `{str(e)}`\n\nCoba lagi atau hubungi admin."
        )

def handle_start_command(chat_id: int, args: list):
    from apps.pengaturan.models import TelegramSubscriber

    if args:
        code = args[0]
        # Cari subscriber dengan kode ini
        try:
            sub = TelegramSubscriber.objects.get(verification_code=code, is_active=True)
            sub.telegram_chat_id = str(chat_id)
            sub.telegram_verified = True
            sub.save()

            text = (
                f"✅ *Berhasil!*\n\n"
                f"Halo *{sub.nama}*, akun Telegram Anda telah terhubung dengan sistem notifikasi *Pabrik Tempe Pak Iwan*.\n\n"
                f"Anda sekarang dapat menggunakan perintah `/rekap` untuk melihat laporan keuangan."
            )
            send_message(chat_id, text)
            return
        except TelegramSubscriber.DoesNotExist:
            send_message(chat_id, "❌ Kode verifikasi tidak valid atau sudah tidak aktif. Silakan hubungi Superadmin.")
            return

    if is_allowed_chat(chat_id):
        text = (
            "👋 *Halo! Selamat datang di Bot UMKM Tempe.*\n\n"
            "Berikut perintah yang tersedia:\n\n"
            "📊 `/rekap` — Rekap keuangan bulan ini\n"
            "📊 `/rekap harian` — Rekap hari ini\n"
            "📊 `/rekap bulanan` — Rekap bulan ini\n"
            "📊 `/rekap tahunan` — Rekap tahun ini\n\n"
        )
        send_message(chat_id, text)
    else:
        send_message(chat_id, "👋 *Halo!*\n\nAnda belum terdaftar. Silakan minta Superadmin untuk mendaftarkan Anda dan klik link verifikasi yang diberikan.")

def handle_help_command(chat_id: int):
    handle_start_command(chat_id, [])

def process_update(update: dict):
    """
    Entry point: proses satu update dari Telegram.
    Dipanggil oleh webhook view.
    """
    message = update.get('message', {})
    if not message:
        return

    chat_id = message.get('chat', {}).get('id')
    if not chat_id:
        return

    text = message.get('text', '')
    if not text.startswith('/'):
        # Hanya balas jika dia authorized
        if is_allowed_chat(chat_id):
            send_message(chat_id, "Gunakan perintah /rekap atau /help")
        return

    parts = text.split()
    command = parts[0].lower().split('@')[0]  # hapus @botname jika ada
    args = parts[1:]

    # Jika command start, biarkan tembus is_allowed_chat untuk verifikasi
    if command == '/start':
        handle_start_command(chat_id, args)
        return

    # Untuk command lain, wajib allowed
    if not is_allowed_chat(chat_id):
        send_message(chat_id, "⛔ Akses ditolak. Bot ini hanya untuk admin UMKM Tempe.")
        return

    if command == '/help':
        handle_help_command(chat_id)
    elif command == '/rekap':
        handle_rekap_command(chat_id, args)
    else:
        send_message(chat_id, f"Perintah `{command}` tidak dikenal. Ketik /help untuk bantuan.")
