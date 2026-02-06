import { useState, useCallback, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  useTheme,
  IconButton,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import { DataGrid } from "@mui/x-data-grid";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import { fetchEmployees, addEmployee, removeEmployee } from "../../api/employeeApi";

const employeeSchema = yup.object().shape({
  full_name: yup.string().required("Full name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  department: yup.string().required("Department is required"),
});

const initialValues = {
  full_name: "",
  email: "",
  department: "",
};

const ManageEmployees = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEmployees();
      setEmployees(data);
    } catch (err) {
      setError(err.message || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const handleAddEmployee = useCallback(
    async (values, { resetForm }) => {
      setError(null);
      setSubmitting(true);
      try {
        await addEmployee({
          full_name: values.full_name.trim(),
          email: values.email.trim().toLowerCase(),
          department: values.department.trim(),
        });
        resetForm();
        await loadEmployees();
      } catch (err) {
        setError(err.message || "Failed to add employee");
      } finally {
        setSubmitting(false);
      }
    },
    [loadEmployees]
  );

  const handleRemoveEmployee = useCallback(
    async (employeeId) => {
      setError(null);
      try {
        await removeEmployee(employeeId);
        await loadEmployees();
      } catch (err) {
        setError(err.message || "Failed to remove employee");
      }
    },
    [loadEmployees]
  );

  const columns = [
    { field: "employeeId", headerName: "ID", width: 80 },
    { field: "full_name", headerName: "Full Name", flex: 1, minWidth: 160 },
    { field: "email", headerName: "Email", flex: 1, minWidth: 200 },
    { field: "department", headerName: "Department", flex: 1, minWidth: 140 },
    {
      field: "actions",
      headerName: "Actions",
      width: 90,
      sortable: false,
      renderCell: ({ row }) => (
        <IconButton
          aria-label="Remove employee"
          onClick={() => handleRemoveEmployee(row.employeeId)}
          sx={{ color: colors.redAccent[500] }}
        >
          <DeleteOutlinedIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Box m="20px">
      <Header
        title="MANAGE EMPLOYEES"
        subtitle="Add, view, and remove employees"
      />

      {/* Add Employee Form */}
      <Box
        backgroundColor={colors.primary[400]}
        p="24px"
        borderRadius="8px"
        mb="24px"
      >
        <Typography
          variant="h5"
          fontWeight="600"
          color={colors.grey[100]}
          sx={{ mb: 2 }}
        >
          Add new employee
        </Typography>
        {error && (
          <Typography color={colors.redAccent[500]} sx={{ mb: 1 }}>
            {error}
          </Typography>
        )}
        <Formik
          onSubmit={handleAddEmployee}
          initialValues={initialValues}
          validationSchema={employeeSchema}
        >
          {({
            values,
            errors,
            touched,
            handleBlur,
            handleChange,
            handleSubmit,
          }) => (
            <form onSubmit={handleSubmit}>
              <Box
                display="grid"
                gap="20px"
                gridTemplateColumns="repeat(3, minmax(0, 1fr))"
                sx={{
                  "& > div": { gridColumn: isNonMobile ? undefined : "span 3" },
                }}
              >
                <TextField
                  fullWidth
                  variant="filled"
                  type="text"
                  label="Full Name"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.full_name}
                  name="full_name"
                  error={!!touched.full_name && !!errors.full_name}
                  helperText={touched.full_name && errors.full_name}
                  sx={{ gridColumn: "span 1" }}
                />
                <TextField
                  fullWidth
                  variant="filled"
                  type="email"
                  label="Email Address"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.email}
                  name="email"
                  error={!!touched.email && !!errors.email}
                  helperText={touched.email && errors.email}
                  sx={{ gridColumn: "span 1" }}
                />
                <TextField
                  fullWidth
                  variant="filled"
                  type="text"
                  label="Department"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.department}
                  name="department"
                  error={!!touched.department && !!errors.department}
                  helperText={touched.department && errors.department}
                  sx={{ gridColumn: "span 1" }}
                />
              </Box>
              <Box display="flex" justifyContent="flex-start" mt="20px">
                <Button
                  type="submit"
                  color="secondary"
                  variant="contained"
                  disabled={submitting}
                  startIcon={
                    submitting ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <PersonAddOutlinedIcon />
                    )
                  }
                >
                  {submitting ? "Adding…" : "Add employee"}
                </Button>
              </Box>
            </form>
          )}
        </Formik>
      </Box>

      {/* Employee List */}
      <Box
        backgroundColor={colors.primary[400]}
        borderRadius="8px"
        overflow="hidden"
      >
        <Box
          p="16px 24px"
          borderBottom={`1px solid ${colors.primary[500]}`}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h5" fontWeight="600" color={colors.grey[100]}>
            All employees
          </Typography>
          <IconButton
            onClick={loadEmployees}
            disabled={loading}
            sx={{ color: colors.grey[300] }}
            aria-label="Refresh employees"
          >
            <RefreshOutlinedIcon />
          </IconButton>
        </Box>
        <Box
          height="400px"
          sx={{
            "& .MuiDataGrid-root": { border: "none" },
            "& .MuiDataGrid-cell": { borderBottom: "none" },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: colors.blueAccent[700],
              borderBottom: "none",
            },
            "& .MuiDataGrid-virtualScroller": {
              backgroundColor: colors.primary[400],
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "none",
              backgroundColor: colors.blueAccent[700],
            },
          }}
        >
          {loading ? (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              height="100%"
              gap={1}
            >
              <CircularProgress size={24} color="secondary" />
              <Typography color={colors.grey[400]}>
                Loading employees…
              </Typography>
            </Box>
          ) : employees.length === 0 ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              height="100%"
              gap={1}
            >
              <Typography color={colors.grey[400]}>
                No employees yet.
              </Typography>
              <Typography variant="body2" color={colors.grey[500]}>
                Add an employee using the form above.
              </Typography>
            </Box>
          ) : (
            <DataGrid
              rows={employees}
              columns={columns}
              getRowId={(row) => row.employeeId}
              pageSize={10}
              rowsPerPageOptions={[5, 10, 25]}
              disableSelectionOnClick
              autoHeight={false}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ManageEmployees;
