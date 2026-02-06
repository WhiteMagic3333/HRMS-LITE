from django.urls import include, path
from django.urls import path, include
from . import views

urlpatterns = [
    path('', views.ApiOverview, name="Api-Overview"),
    path('employee-list/', views.EmployeeList, name="EmployeeList"),
    path('employee-list-all/', views.EmployeeListAll, name="EmployeeListAll"),
    path('employee-add/', views.EmployeeAdd, name="EmployeeAdd"),
    path('employee-remove/', views.EmployeeRemove, name="EmployeeRemove"),
    path('attendance-by-date/', views.AttendanceByDate, name="AttendanceByDate"),
    path('employeeAttendance-list/', views.EmployeeAttendanceList, name="EmployeeAttendanceList"),
    path('employeeAttendance-set/', views.EmployeeAttendaceSet, name="EmployeeAttendanceSet"),
    path('employeeAttendance-days/', views.EmployeeAttendaceDays, name="EmployeeAttendanceDays"),
    
]