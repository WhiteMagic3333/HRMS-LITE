import { API_BASE } from "../config";

/**
 * Fetch all active employees.
 * GET /api/employee-list/
 */
export async function fetchEmployees() {
  const res = await fetch(`${API_BASE}/employee-list/`);
  if (!res.ok) throw new Error("Failed to fetch employees");
  return res.json();
}

export async function fetchEmployeesAll() {
  const res = await fetch(`${API_BASE}/employee-list-all/`);
  if (!res.ok) throw new Error("Failed to fetch all employees");
  return res.json();
}

/**
 * Add a new employee.
 * POST /api/employee-add/
 * Body: { full_name, email, department }
 */
export async function addEmployee({ full_name, email, department }) {
  const res = await fetch(`${API_BASE}/employee-add/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ full_name, email, department }),
  });
  const data = await res.json();
  if (data.status !== 200) {
    throw new Error(data.Message || "Failed to add employee");
  }
  return data;
}

/**
 * Deactivate (soft-delete) an employee.
 * POST /api/employee-remove/
 * Body: { employeeId }
 */
export async function removeEmployee(employeeId) {
  const res = await fetch(`${API_BASE}/employee-remove/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ employeeId }),
  });
  const data = await res.json();
  if (data.status !== 200) {
    throw new Error(data.Message || "Failed to remove employee");
  }
  return data;
}
