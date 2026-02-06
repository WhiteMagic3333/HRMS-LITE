from rest_framework import serializers
from .models import Attendance, Employee


class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'
        read_only_fields = ('employeeId', 'created_at', 'is_active', 'presentDays', 'absentDays')


class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = '__all__'

