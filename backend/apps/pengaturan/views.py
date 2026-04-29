from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView
from django.shortcuts import get_object_or_404

from .models import Pengaturan
from .serializers import PengaturanSerializer, PengaturanTelegramSerializer
from apps.telegram_bot.services import send_message


class PengaturanListView(ListAPIView):
    """List semua pengaturan."""
    queryset = Pengaturan.objects.all()
    serializer_class = PengaturanSerializer
    permission_classes = [IsAuthenticated]


class PengaturanDetailView(RetrieveUpdateAPIView):
    """Detail dan Update pengaturan tunggal."""
    queryset = Pengaturan.objects.all()
    serializer_class = PengaturanSerializer
    permission_classes = [IsAuthenticated]


class PengaturanUpdateView(APIView):
    """Update pengaturan berdasarkan jenis."""
    permission_classes = [IsAuthenticated]

    def post(self, request, jenis):
        """Simpan pengaturan berdasarkan jenis."""
        if jenis == 'telegram':
            serializer = PengaturanTelegramSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            data = serializer.validated_data

            # Simpan masing-masing pengaturan
            if 'bot_token' in data:
                Pengaturan.set('telegram', 'bot_token', data['bot_token'], 'Token bot Telegram', request.user)
            if 'chat_id' in data:
                Pengaturan.set('telegram', 'chat_id', data['chat_id'], 'Chat ID untuk notifikasi', request.user)
            if 'notifications_enabled' in data:
                Pengaturan.set('telegram', 'notifications_enabled', str(data['notifications_enabled']), 'Aktifkan notifikasi', request.user)

            return Response({'message': 'Pengaturan Telegram berhasil disimpan', 'success': True})

        elif jenis == 'notifikasi':
            for key, value in request.data.items():
                Pengaturan.set('notifikasi', key, str(value), f'Pengaturan notifikasi {key}', request.user)
            return Response({'message': 'Pengaturan Notifikasi berhasil disimpan', 'success': True})

        return Response({'error': 'Jenis pengaturan tidak valid'}, status=status.HTTP_400_BAD_REQUEST)


class TelegramSettingsView(APIView):
    """Ambil dan update pengaturan Telegram."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Ambil pengaturan Telegram."""
        bot_token = Pengaturan.get('telegram', 'bot_token', '')
        chat_id = Pengaturan.get('telegram', 'chat_id', '')
        notifications_enabled = Pengaturan.get('telegram', 'notifications_enabled', 'false') == 'true'

        return Response({
            'bot_token': bot_token,
            'chat_id': chat_id,
            'notifications_enabled': notifications_enabled,
        })

    def post(self, request):
        """Simpan pengaturan Telegram."""
        serializer = PengaturanTelegramSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        user = request.user

        if 'bot_token' in data:
            Pengaturan.set('telegram', 'bot_token', data['bot_token'], 'Token bot Telegram', user)
        if 'chat_id' in data:
            Pengaturan.set('telegram', 'chat_id', data['chat_id'], 'Chat ID untuk notifikasi', user)
        if 'notifications_enabled' in data:
            Pengaturan.set('telegram', 'notifications_enabled', str(data['notifications_enabled']), 'Aktifkan notifikasi', user)

        return Response({'message': 'Pengaturan Telegram berhasil disimpan', 'success': True})


class TestTelegramView(APIView):
    """Test pengiriman pesan Telegram."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Kirim pesan test ke Telegram."""
        bot_token = request.data.get('bot_token')
        chat_id = request.data.get('chat_id')

        if not bot_token or not chat_id:
            # Ambi dari DB jika tidak ada di request
            bot_token = Pengaturan.get('telegram', 'bot_token')
            chat_id = Pengaturan.get('telegram', 'chat_id')

        if not bot_token or not chat_id:
            return Response(
                {'error': 'Bot Token dan Chat ID harus diisi'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            chat_id = int(chat_id)
        except ValueError:
            return Response(
                {'error': 'Chat ID harus berupa angka'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Import fungsi send_message dengan token dinamis
        import requests
        telegram_api = f"https://api.telegram.org/bot{bot_token}"

        text = "✅ *Tes Notifikasi*\n\nHalo! Ini adalah pesan test dari *Pabrik Tempe Pak Iwan*.\n\nJika Anda menerima pesan ini, berarti konfigurasi Telegram berhasil!"

        try:
            resp = requests.post(
                f"{telegram_api}/sendMessage",
                json={
                    'chat_id': chat_id,
                    'text': text,
                    'parse_mode': 'Markdown',
                },
                timeout=15,
            )

            if resp.status_code == 200 and resp.json().get('ok'):
                return Response({'message': 'Pesan test berhasil dikirim!', 'success': True})
            else:
                error_msg = resp.json().get('description', 'Gagal mengirim pesan')
                return Response({'error': f'Gagal mengirim pesan: {error_msg}'}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({'error': f'Error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from .models import TelegramSubscriber
from .serializers import TelegramSubscriberSerializer

class TelegramSubscriberViewSet(ModelViewSet):
    """CRUD untuk Telegram Subscriber (Admin Notifikasi)"""
    queryset = TelegramSubscriber.objects.all()
    serializer_class = TelegramSubscriberSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'])
    def test_message(self, request, pk=None):
        """Tes kirim pesan spesifik ke subscriber ini."""
        subscriber = self.get_object()
        
        if not subscriber.telegram_verified or not subscriber.telegram_chat_id:
            return Response({'error': 'Admin ini belum menghubungkan akun Telegramnya.'}, status=400)
            
        bot_token = Pengaturan.get('telegram', 'bot_token')
        if not bot_token:
            return Response({'error': 'Bot Token belum dikonfigurasi di Pengaturan Telegram.'}, status=400)
            
        import requests
        telegram_api = f"https://api.telegram.org/bot{bot_token}"
        text = f"✅ *Tes Notifikasi Personal*\n\nHalo *{subscriber.nama}*!\nKoneksi Telegram Anda dengan sistem *Pabrik Tempe Pak Iwan* sudah berhasil dan berjalan dengan baik."

        try:
            resp = requests.post(
                f"{telegram_api}/sendMessage",
                json={
                    'chat_id': subscriber.telegram_chat_id,
                    'text': text,
                    'parse_mode': 'Markdown',
                },
                timeout=15,
            )

            if resp.status_code == 200 and resp.json().get('ok'):
                return Response({'message': 'Pesan test berhasil dikirim!', 'success': True})
            else:
                error_msg = resp.json().get('description', 'Gagal mengirim pesan')
                return Response({'error': f'Gagal mengirim pesan: {error_msg}'}, status=400)

        except Exception as e:
            return Response({'error': f'Error: {str(e)}'}, status=500)