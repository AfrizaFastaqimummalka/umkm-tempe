from rest_framework import serializers
from .models import Inventori, InventoriMovement


class InventoriSerializer(serializers.ModelSerializer):
    class Meta:
        model = Inventori
        fields = ['id', 'nama_barang', 'jumlah_stok', 'satuan', 'tanggal_update', 'created_at', 'updated_at']
        read_only_fields = ['id', 'tanggal_update', 'created_at', 'updated_at']

    def validate_jumlah_stok(self, value):
        if value < 0:
            raise serializers.ValidationError("Jumlah stok tidak boleh negatif")
        return value


class InventoriMovementSerializer(serializers.ModelSerializer):
    inventori_nama = serializers.CharField(source='inventori.nama_barang', read_only=True)

    class Meta:
        model = InventoriMovement
        fields = ['id', 'inventori', 'inventori_nama', 'jenis', 'jumlah', 'keterangan', 'tanggal', 'created_by']
        read_only_fields = ['id', 'tanggal', 'created_by']

    def validate_jumlah(self, value):
        if value <= 0:
            raise serializers.ValidationError("Jumlah harus lebih dari 0")
        return value