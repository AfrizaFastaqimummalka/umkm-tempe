from rest_framework import serializers
from .models import Pemasok


class PemasokSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pemasok
        fields = ['id', 'nama_pemasok', 'alamat', 'no_hp', 'email', 'catatan', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_no_hp(self, value):
        if value:
            # Remove any non-digit characters for validation
            digits = ''.join(filter(str.isdigit, value))
            if len(digits) < 8:
                raise serializers.ValidationError("Nomor HP terlalu pendek")
        return value