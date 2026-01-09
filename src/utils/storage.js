// Utility functions for localStorage management

const saveEmployeesInternal = (employees) => {
  try {
    localStorage.setItem('employees', JSON.stringify(employees));
  } catch (error) {
    console.error('Error saving employees to localStorage:', error);
  }
};

export const getEmployees = () => {
  try {
    const employees = localStorage.getItem('employees');
    const parsed = employees ? JSON.parse(employees) : [];
    
    // Migrate old data format (add IDs if missing)
    let needsMigration = false;
    const migrated = parsed.map((emp, index) => {
      if (!emp.id) {
        needsMigration = true;
        return {
          ...emp,
          id: emp.name + '_' + index + '_' + Date.now(),
          status: emp.status || 'Present',
        };
      }
      return emp;
    });
    
    // Save migrated data if migration occurred
    if (needsMigration) {
      saveEmployeesInternal(migrated);
    }
    
    return migrated;
  } catch (error) {
    console.error('Error reading employees from localStorage:', error);
    return [];
  }
};

export const saveEmployees = (employees) => {
  saveEmployeesInternal(employees);
};

export const addEmployee = (employee) => {
  const employees = getEmployees();
  const newEmployee = {
    ...employee,
    id: employee.employeeId || employee.id || Date.now().toString(),
    employeeId: employee.employeeId || employee.id || Date.now().toString(),
    status: employee.status || 'Present',
    createdAt: new Date().toISOString(),
    // Ensure all new fields have defaults
    skills: employee.skills || '',
    skillLevel: employee.skillLevel || 1,
    experience: employee.experience || 0,
    category: employee.category || 'Full-time',
    availability: employee.availability || 'Available',
    performanceRating: employee.performanceRating || 0,
  };
  employees.push(newEmployee);
  saveEmployees(employees);
  return newEmployee;
};

export const addEmployees = (employeesList) => {
  const existingEmployees = getEmployees();
  const newEmployees = employeesList.map(emp => ({
    ...emp,
    id: emp.employeeId || emp.id || Date.now().toString() + '_' + Math.random(),
    employeeId: emp.employeeId || emp.id || Date.now().toString() + '_' + Math.random(),
    status: emp.status || 'Present',
    createdAt: new Date().toISOString(),
    skills: emp.skills || '',
    skillLevel: emp.skillLevel || 1,
    experience: emp.experience || 0,
    category: emp.category || 'Full-time',
    availability: emp.availability || 'Available',
    performanceRating: emp.performanceRating || 0,
  }));
  
  const allEmployees = [...existingEmployees, ...newEmployees];
  saveEmployees(allEmployees);
  return newEmployees;
};

export const deleteEmployee = (id) => {
  const employees = getEmployees();
  const filtered = employees.filter(emp => emp.id !== id);
  saveEmployees(filtered);
  return filtered;
};

export const updateEmployeeStatus = (id, status) => {
  const employees = getEmployees();
  const updated = employees.map(emp =>
    emp.id === id ? { ...emp, status } : emp
  );
  saveEmployees(updated);
  return updated;
};

