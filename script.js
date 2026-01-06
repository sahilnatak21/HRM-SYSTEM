// Load employees from localStorage
let employees = JSON.parse(localStorage.getItem("employees")) || [];

// DASHBOARD - Show total employees
if (document.getElementById("totalEmployees")) {
  document.getElementById("totalEmployees").innerText = employees.length;
}

// EMPLOYEE LIST
if (document.getElementById("employeeTable")) {
  const tbody = document.querySelector("#employeeTable tbody");
  employees.forEach((emp, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${emp.name}</td>
      <td>${emp.department}</td>
      <td>${emp.role}</td>
      <td><button class="delete-btn" onclick="deleteEmployee(${index})">Delete</button></td>
    `;
    tbody.appendChild(row);
  });
}

// ADD EMPLOYEE
if (document.getElementById("addEmployeeForm")) {
  document.getElementById("addEmployeeForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const department = document.getElementById("department").value;
    const role = document.getElementById("role").value;

    employees.push({ name, department, role, status: "Present" });
    localStorage.setItem("employees", JSON.stringify(employees));

    alert("✅ Employee added successfully!");
    e.target.reset();
  });
}

// DELETE EMPLOYEE
function deleteEmployee(index) {
  if (confirm("Are you sure you want to delete this employee?")) {
    employees.splice(index, 1);
    localStorage.setItem("employees", JSON.stringify(employees));
    location.reload();
  }
}

// ATTENDANCE
if (document.getElementById("attendanceTable")) {
  const tbody = document.querySelector("#attendanceTable tbody");
  employees.forEach((emp, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${emp.name}</td>
      <td id="status-${index}" class="${emp.status === 'Present' ? 'green-text' : 'red-text'}">${emp.status}</td>
      <td><button onclick="toggleStatus(${index})">Toggle</button></td>
    `;
    tbody.appendChild(row);
  });
}

function toggleStatus(index) {
  employees[index].status = employees[index].status === "Present" ? "Absent" : "Present";
  localStorage.setItem("employees", JSON.stringify(employees));
  document.getElementById(`status-${index}`).innerText = employees[index].status;
  document.getElementById(`status-${index}`).className =
    employees[index].status === "Present" ? "green-text" : "red-text";
}

// Styling for status
document.head.insertAdjacentHTML("beforeend", `
<style>
.green-text { color: green; font-weight: bold; }
.red-text { color: red; font-weight: bold; }
</style>
`);


