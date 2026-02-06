import { Routes, Route, Navigate } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import ManageEmployees from "./scenes/employees";
import MarkAttendance from "./scenes/attendance/MarkAttendance";
import EmployeeAttendanceDetails from "./scenes/attendance/EmployeeAttendanceDetails";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";

function App() {
  const [theme, colorMode] = useMode();

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          <Sidebar />
          <main className="content">
            <Topbar />
            <Routes>
              <Route path="/" element={<ManageEmployees />} />
              <Route path="/attendance" element={<Navigate to="/attendance/mark" replace />} />
              <Route path="/attendance/mark" element={<MarkAttendance />} />
              <Route path="/attendance/details" element={<EmployeeAttendanceDetails />} />
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
