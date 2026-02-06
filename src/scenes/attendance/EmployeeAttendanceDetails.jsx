import { useState, useMemo, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import {
  Box,
  Button,
  TextField,
  Typography,
  useTheme,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import { fetchEmployeesAll } from "../../api/employeeApi";
import {
  fetchEmployeeAttendanceList,
  fetchEmployeeAttendanceDays,
} from "../../api/attendanceApi";

const EmployeeAttendanceDetails = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [stats, setStats] = useState(null);

  const handleSearch = useCallback(
    async (e) => {
      e.preventDefault();
      const query = searchId.trim();
      if (!query) return;

      setLoading(true);
      setError(null);
      setEmployee(null);
      setAttendanceRecords([]);
      setStats(null);

      try {
        // Fetch all employees and find the one matching by ID or email
        const employees = await fetchEmployeesAll();
        const found = employees.find(
          (emp) =>
            String(emp.employeeId) === query ||
            emp.email.toLowerCase() === query.toLowerCase()
        );

        if (!found) {
          setError(`No employee found with ID or email "${query}"`);
          setLoading(false);
          return;
        }

        setEmployee(found);

        // Fetch attendance records and stats
        const [records, daysStats] = await Promise.all([
          fetchEmployeeAttendanceList(found.employeeId).catch(() => []),
          fetchEmployeeAttendanceDays(found.employeeId).catch(() => null),
        ]);

        setAttendanceRecords(records);
        setStats(daysStats);
      } catch (err) {
        setError(err.message || "Failed to load employee data");
      } finally {
        setLoading(false);
      }
    },
    [searchId]
  );

  // Build a map of date -> status from attendance records
  const attendanceMap = useMemo(() => {
    const map = {};
    attendanceRecords.forEach((record) => {
      // Backend returns date as "YYYY-MM-DD" string
      map[record.date] = record.status;
    });
    return map;
  }, [attendanceRecords]);

  const dayCellClassNames = useMemo(() => {
    return (arg) => {
      const d = arg.date;
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const status = attendanceMap[dateStr];
      if (status === "PE") return ["attendance-day-present"];
      if (status === "AB") return ["attendance-day-absent"];
      return ["attendance-day-unmarked"];
    };
  }, [attendanceMap]);

  return (
    <Box m="20px">
      <Header
        title="EMPLOYEE ATTENDANCE DETAILS"
        subtitle="Search by employee ID or email to view attendance calendar"
      />

      <Box
        component="form"
        onSubmit={handleSearch}
        display="flex"
        alignItems="center"
        gap={2}
        mb={3}
      >
        <TextField
          fullWidth
          variant="filled"
          placeholder="Employee ID or Email"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlinedIcon sx={{ color: colors.grey[400] }} />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400 }}
        />
        <Button
          type="submit"
          variant="contained"
          color="secondary"
          disabled={loading}
          startIcon={
            loading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <VisibilityOutlinedIcon />
            )
          }
        >
          {loading ? "Loading…" : "View"}
        </Button>
      </Box>

      {error && (
        <Box
          backgroundColor={colors.primary[400]}
          p={3}
          borderRadius="8px"
          mb={2}
        >
          <Typography color={colors.redAccent[500]}>{error}</Typography>
        </Box>
      )}

      {employee && (
        <>
          <Box mb={2} display="flex" justifyContent="space-between" flexWrap="wrap" gap={2}>
            <Typography variant="h6" color={colors.grey[100]}>
              {employee.full_name} (ID: {employee.employeeId}) — {employee.department}
            </Typography>
            {stats && (
              <Box display="flex" gap={3}>
                <Typography variant="body1" color={colors.greenAccent[400]}>
                  Present: {stats.presentDays} / {stats.presentDays + stats.absentDays}
                </Typography>
                <Typography variant="body1" color={colors.redAccent[400]}>
                  Absent: {stats.absentDays} / {stats.presentDays + stats.absentDays}
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            backgroundColor={colors.primary[400]}
            p="16px"
            borderRadius="8px"
            sx={{
              "& .fc": {
                "--fc-page-bg-color": "transparent",
                "--fc-neutral-bg-color": "transparent",
              },
              "& .fc-theme-standard td": { borderColor: colors.primary[500] },
              "& .fc-theme-standard th": {
                borderColor: colors.primary[500],
                backgroundColor: colors.blueAccent[700],
                color: colors.grey[100],
              },
              "& .fc-scrollgrid": { borderColor: colors.primary[500] },
              "& .fc-daygrid-day-number": { color: colors.grey[300] },
              "& .attendance-day-present": {
                backgroundColor: `${colors.greenAccent[700]}44 !important`,
              },
              "& .attendance-day-absent": {
                backgroundColor: `${colors.redAccent[700]}44 !important`,
              },
              "& .attendance-day-unmarked": {
                backgroundColor: "transparent",
              },
            }}
          >
            <FullCalendar
              plugins={[dayGridPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "",
              }}
              height="70vh"
              dayCellClassNames={dayCellClassNames}
              editable={false}
              selectable={false}
            />
          </Box>
          <Box display="flex" gap={3} mt={2} flexWrap="wrap">
            <Box display="flex" alignItems="center" gap={1}>
              <Box
                width={24}
                height={24}
                borderRadius={1}
                sx={{ backgroundColor: `${colors.greenAccent[700]}44` }}
              />
              <Typography variant="body2" color={colors.grey[300]}>
                Present
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Box
                width={24}
                height={24}
                borderRadius={1}
                sx={{ backgroundColor: `${colors.redAccent[700]}44` }}
              />
              <Typography variant="body2" color={colors.grey[300]}>
                Absent
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Box
                width={24}
                height={24}
                borderRadius={1}
                sx={{ backgroundColor: "transparent", border: `1px solid ${colors.grey[600]}` }}
              />
              <Typography variant="body2" color={colors.grey[300]}>
                Unmarked
              </Typography>
            </Box>
          </Box>
        </>
      )}

      {!employee && !error && !loading && (
        <Box
          backgroundColor={colors.primary[400]}
          p={4}
          borderRadius="8px"
          textAlign="center"
        >
          <Typography color={colors.grey[400]}>
            Enter an employee ID or email and press Enter to view their attendance calendar.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default EmployeeAttendanceDetails;
