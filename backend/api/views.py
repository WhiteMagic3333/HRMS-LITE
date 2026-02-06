from django.http import JsonResponse
from django.db import IntegrityError
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.parsers import JSONParser

from api.models import Attendance, Employee
from .serializers import AttendanceSerializer, EmployeeSerializer

from datetime import datetime

@api_view(['GET'])
def ApiOverview(request):
    apiUrls = {
        'List all Employees' : 'employee-list/',
        'Add an Employee': 'employee-add',
        'Remove an Employee': 'employee-delete',
    }

    return Response(apiUrls)


@api_view(['GET'])
def EmployeeList(request):
    employeeDetails = Employee.objects.filter(is_active=True)
    serializedData = EmployeeSerializer(employeeDetails, many=True)
    return Response(serializedData.data)

@api_view(['GET'])
def EmployeeListAll(request):
    employeeDetails = Employee.objects.all()
    serializedData = EmployeeSerializer(employeeDetails, many=True)
    return Response(serializedData.data)


def _first_error_message(serializer_errors):
    """Get a single user-friendly message from serializer errors."""
    for field, errors in serializer_errors.items():
        if errors:
            msg = str(errors[0])
            if 'already exists' in msg.lower() or 'unique' in msg.lower():
                return "An employee with this email already exists."
            return msg
    return "Invalid data."


@api_view(['POST'])
def EmployeeAdd(request):
    formData = JSONParser().parse(request)
    serializer = EmployeeSerializer(data=formData)
    if not serializer.is_valid():
        message = _first_error_message(serializer.errors)
        return JsonResponse(
            {"status": 400, "Message": message, "errors": serializer.errors},
            status=400,
            safe=False,
        )
    try:
        serializer.save()
    except IntegrityError as e:
        if 'unique' in str(e).lower() or 'duplicate' in str(e).lower():
            return JsonResponse(
                {"status": 400, "Message": "An employee with this email already exists."},
                status=400,
            )
        raise
    return JsonResponse({"status": 200, "Message": "Data inserted"})
    

@api_view(['POST'])
def EmployeeRemove(request):
    employeeId = request.data.get('employeeId')
    try:
        employee = Employee.objects.get(pk=employeeId)
        employee.is_active = False
        employee.save()
        return JsonResponse({"status": 200, "Message": "Employee Deactivated Successfully"})
    except Employee.DoesNotExist:
        return JsonResponse({"status": 404, "Message": "Employee not found"}, status=404)
    

@api_view(['POST'])
def EmployeeAttendaceDays(request):
    employeeId = request.data.get('employeeId')
    try:
        stats = Employee.objects.filter(employeeId=employeeId).values('presentDays', 'absentDays').first()
        
        if not stats:
            return Response({"error": "Employee not found"}, status=404)
            
        return Response(stats)
        
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['POST'])
def AttendanceByDate(request):
    """
    Get all active employees with their attendance status for a specific date.
    POST body: { date: "YYYY-MM-DD" }
    Returns list of { employeeId, full_name, email, department, status }
    """
    date_str = request.data.get('date')
    if not date_str:
        return JsonResponse(
            {"status": 400, "Message": "date is required"},
            status=400
        )

    date = datetime.strptime(date_str, "%Y-%m-%d").date()

    employees = Employee.objects.filter(
        is_active=True,
        created_at__date__lte=date
    )

    result = []

    for emp in employees:
        attendance = Attendance.objects.filter(
            employee_id=emp,
            date=date
        ).first()

        result.append({
            "employeeId": emp.employeeId,
            "full_name": emp.full_name,
            "email": emp.email,
            "department": emp.department,
            "status": attendance.status if attendance else None,
        })

    return Response(result)


@api_view(['POST'])
def EmployeeAttendanceList(request):
    employeeId = request.data.get('employeeId')
    try:
        attendanceData = Attendance.objects.filter(employee_id=employeeId, employee_id__is_active=True)

        if not attendanceData:
            raise Attendance.DoesNotExist
        serializer = AttendanceSerializer(attendanceData, many=True)
        return Response(serializer.data)
    except Attendance.DoesNotExist:
        return JsonResponse(
            {"status": 404, "Message": "Employee attendance record not found"},
            status=404,
        )
    
@api_view(['POST'])
def EmployeeAttendaceSet(request):
    employeeId = request.data.get('employeeId')
    date = request.data.get('date')
    status = request.data.get('status')

    if not status or status not in ('PE', 'AB'):
        return JsonResponse(
            {"status": 400, "Message": "Invalid status. Use PE (Present) or AB (Absent)."},
            status=400,
        )

    try:
        employee = Employee.objects.get(employeeId=employeeId)
    except Employee.DoesNotExist:
        return JsonResponse({"status": 404, "Message": "Employee not found"}, status=404)
    old_obj = Attendance.objects.filter(
        employee_id_id=employeeId,
        date=date,
    ).first()
    old_status = old_obj.status if old_obj else None

    obj, created = Attendance.objects.update_or_create(
        employee_id_id=employeeId,
        date=date,
        defaults={'status': status},
    )

    # Only update presentDays/absentDays when status actually changes
    if created:
        if status == "PE":
            employee.presentDays += 1
        elif status == "AB":
            employee.absentDays += 1
    else:
        if old_status == status:
            # No change: do not modify counts
            pass
        elif old_status == "PE" and status == "AB":
            employee.presentDays = max(0, employee.presentDays - 1)
            employee.absentDays += 1
        elif old_status == "AB" and status == "PE":
            employee.absentDays = max(0, employee.absentDays - 1)
            employee.presentDays += 1
        elif old_status == "BL" and status == "PE":
            employee.presentDays += 1
        elif old_status == "BL" and status == "AB":
            employee.absentDays += 1

    employee.save()

    return Response({
        "message": "Created" if created else "Updated",
    })