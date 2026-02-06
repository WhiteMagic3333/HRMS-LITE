import { API_BASE } from "../config";

/**
 * Get all active employees with their attendance status for a specific date.
 * POST /api/attendance-by-date/
 * Body: { date: "YYYY-MM-DD" }
 * Returns: [{ employeeId, full_name, email, department, status }]
 * status is "PE", "AB", or null (unmarked)
 */
export async function fetchAttendanceByDate(date) {
  const res = await fetch(`${API_BASE}/attendance-by-date/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date }),
  });
  if (!res.ok) throw new Error("Failed to fetch attendance data");
  return res.json();
}

/**
 * Set attendance status for one employee on one date.
 * POST /api/employeeAttendance-set/
 * Body: { employeeId, date, status } where status is "PE" or "AB"
 */
export async function setEmployeeAttendance(employeeId, date, status) {
  const res = await fetch(`${API_BASE}/employeeAttendance-set/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ employeeId, date, status }),
  });
  
  let data;
  try {
    data = await res.json();
  } catch (e) {
    throw new Error("Invalid response from server");
  }
  
  if (!res.ok) {
    throw new Error(data.Message || "Failed to set attendance");
  }
  return data;
}

/**
 * Set attendance for multiple employees on one date.
 * Calls setEmployeeAttendance sequentially to avoid overwhelming the server.
 */
export async function setBulkAttendance(date, updates) {
  const results = [];
  for (const { employeeId, status } of updates) {
    const result = await setEmployeeAttendance(employeeId, date, status);
    results.push(result);
  }
  return results;
}

/**
 * Get attendance records for a single employee.
 * POST /api/employeeAttendance-list/
 * Body: { employeeId }
 * Returns attendance records for that employee.
 */
export async function fetchEmployeeAttendanceList(employeeId) {
  const res = await fetch(`${API_BASE}/employeeAttendance-list/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ employeeId }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    if (res.status === 404) return []; // no records yet
    throw new Error(data.Message || "Failed to fetch employee attendance");
  }
  return res.json();
}

/**
 * Get presentDays and absentDays for an employee.
 * POST /api/employeeAttendance-days/
 * Body: { employeeId }
 */
export async function fetchEmployeeAttendanceDays(employeeId) {
  const res = await fetch(`${API_BASE}/employeeAttendance-days/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ employeeId }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || data.Message || "Failed to fetch attendance stats");
  }
  return res.json();
}
