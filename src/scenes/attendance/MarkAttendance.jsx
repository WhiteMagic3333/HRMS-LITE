import { useState, useCallback, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  useTheme,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import { fetchAttendanceByDate, setBulkAttendance } from "../../api/attendanceApi";

const formatDateForInput = (d) => d.toISOString().slice(0, 10);

// Map backend status to display string
const statusDisplay = (status) => {
  if (status === "PE") return "Present";
  if (status === "AB") return "Absent";
  return "—";
};

const MarkAttendance = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [date, setDate] = useState(() => formatDateForInput(new Date()));
  const [search, setSearch] = useState("");
  const [selection, setSelection] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const loadAttendance = useCallback(async (dateStr) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAttendanceByDate(dateStr);
      setEmployees(data);
    } catch (err) {
      setError(err.message || "Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAttendance(date);
  }, [date, loadAttendance]);

  const rows = useMemo(() => {
    let list = employees.map((emp) => ({
      id: emp.employeeId,
      employeeId: emp.employeeId,
      full_name: emp.full_name,
      department: emp.department,
      status: emp.status,
      statusDisplay: statusDisplay(emp.status),
    }));
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.full_name.toLowerCase().includes(q) ||
          String(r.employeeId).includes(q) ||
          r.department.toLowerCase().includes(q)
      );
    }
    return list;
  }, [employees, search]);

  const handleMarkPresent = useCallback(async () => {
    if (!selection.length) return;
    setSubmitting(true);
    setError(null);
    try {
      const updates = selection.map((id) => ({ employeeId: id, status: "PE" }));
      await setBulkAttendance(date, updates);
      await loadAttendance(date);
      setSelection([]);
    } catch (err) {
      setError(err.message || "Failed to mark present");
    } finally {
      setSubmitting(false);
    }
  }, [selection, date, loadAttendance]);

  const handleMarkAbsent = useCallback(async () => {
    if (!selection.length) return;
    setSubmitting(true);
    setError(null);
    try {
      const updates = selection.map((id) => ({ employeeId: id, status: "AB" }));
      await setBulkAttendance(date, updates);
      await loadAttendance(date);
      setSelection([]);
    } catch (err) {
      setError(err.message || "Failed to mark absent");
    } finally {
      setSubmitting(false);
    }
  }, [selection, date, loadAttendance]);

  const columns = [
    { field: "full_name", headerName: "Full Name", flex: 1, minWidth: 160 },
    {
      field: "statusDisplay",
      headerName: "Status",
      flex: 1,
      minWidth: 120,
      renderCell: ({ row }) => (
        <Typography
          variant="body2"
          sx={{
            color:
              row.status === "PE"
                ? colors.greenAccent[500]
                : row.status === "AB"
                ? colors.redAccent[500]
                : colors.grey[400],
          }}
        >
          {row.statusDisplay}
        </Typography>
      ),
    },
    { field: "department", headerName: "Department", flex: 1, minWidth: 140 },
  ];

  return (
    <Box m="20px">
      <Header
        title="MARK ATTENDANCE"
        subtitle="Select date, choose employees, and mark present or absent"
      />

      {error && (
        <Typography color={colors.redAccent[500]} sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Box
        backgroundColor={colors.primary[400]}
        borderRadius="8px"
        overflow="hidden"
      >
        <Box
          p="16px 24px"
          borderBottom={`1px solid ${colors.primary[500]}`}
          display="flex"
          flexWrap="wrap"
          alignItems="center"
          gap={2}
        >
          <TextField
            type="date"
            label="Date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={{ minWidth: 180 }}
          />
          <Box flex="1" display="flex" justifyContent="flex-end">
            <TextField
              size="small"
              placeholder="Search by name, ID, or department"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon sx={{ color: colors.grey[400] }} />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 280 }}
            />
          </Box>
        </Box>

        <Box
          p="16px 24px"
          borderBottom={`1px solid ${colors.primary[500]}`}
          display="flex"
          alignItems="center"
          gap={1}
        >
          <Button
            variant="contained"
            color="secondary"
            size="small"
            startIcon={
              submitting ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <CheckCircleOutlinedIcon />
              )
            }
            onClick={handleMarkPresent}
            disabled={selection.length === 0 || submitting}
          >
            Mark Present
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={
              submitting ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <CancelOutlinedIcon />
              )
            }
            onClick={handleMarkAbsent}
            disabled={selection.length === 0 || submitting}
            sx={{ borderColor: colors.redAccent[500], color: colors.redAccent[500] }}
          >
            Mark Absent
          </Button>
          {selection.length > 0 && (
            <Typography variant="body2" color={colors.grey[400]} sx={{ ml: 1 }}>
              {selection.length} selected
            </Typography>
          )}
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
            "& .MuiCheckbox-root": {
              color: `${colors.greenAccent[200]} !important`,
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
                Loading attendance…
              </Typography>
            </Box>
          ) : rows.length === 0 ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              height="100%"
              gap={1}
            >
              <Typography color={colors.grey[400]}>
                {employees.length === 0
                  ? "No employees found."
                  : "No employees match the search."}
              </Typography>
            </Box>
          ) : (
            <DataGrid
              rows={rows}
              columns={columns}
              checkboxSelection
              onSelectionModelChange={(ids) => setSelection(ids)}
              selectionModel={selection}
              pageSize={10}
              rowsPerPageOptions={[5, 10, 25]}
              disableSelectionOnClick={false}
              autoHeight={false}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default MarkAttendance;
