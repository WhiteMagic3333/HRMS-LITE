# Generated manually for unique email constraint

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_employee_absentdays_employee_presentdays'),
    ]

    operations = [
        migrations.AlterField(
            model_name='employee',
            name='email',
            field=models.EmailField(max_length=254, unique=True),
        ),
    ]
