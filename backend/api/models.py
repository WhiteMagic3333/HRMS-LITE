from django.db import models
from django.contrib.auth.models import User

class Employee(models.Model):
    employeeId = models.BigAutoField(primary_key=True)
    full_name = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    department = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    presentDays = models.IntegerField(default=0)
    absentDays = models.IntegerField(default=0)



class Attendance(models.Model):

    class Status(models.TextChoices):
        PRESENT = 'PE', 'Present'
        ABSENT = 'AB', 'Absent'
        BLANK = 'BL', 'Blank'

    attendanceId = models.BigAutoField(primary_key=True)
    employee_id = models.ForeignKey(Employee, on_delete=models.CASCADE)
    date = models.DateField()
    status = models.CharField(max_length=2,
                              choices=Status.choices,
                              default=Status.BLANK,
                            )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)