// CSV parsing utility

export const parseCSV = (csvText) => {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    throw new Error('CSV file must have at least a header and one data row');
  }

  // Parse header
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
  
  // Expected headers mapping
  const headerMap = {
    'employee_id': 'employeeId',
    'employeeid': 'employeeId',
    'id': 'employeeId',
    'name': 'name',
    'skills': 'skills',
    'skill_level': 'skillLevel',
    'skilllevel': 'skillLevel',
    'level': 'skillLevel',
    'experience': 'experience',
    'experience_(years)': 'experience',
    'years': 'experience',
    'category': 'category',
    'availability': 'availability',
    'performance_rating': 'performanceRating',
    'performancerating': 'performanceRating',
    'rating': 'performanceRating',
    'department': 'department',
    'role': 'role',
  };

  // Map headers to standard field names
  const mappedHeaders = headers.map(h => headerMap[h] || h);

  // Parse data rows
  const employees = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0) continue;

    const employee = {};
    mappedHeaders.forEach((mappedHeader, index) => {
      if (mappedHeader && values[index] !== undefined) {
        const value = values[index].trim();
        
        // Handle numeric fields
        if (mappedHeader === 'experience' || mappedHeader === 'performanceRating') {
          employee[mappedHeader] = value ? parseFloat(value) || 0 : 0;
        } else if (mappedHeader === 'skillLevel') {
          employee[mappedHeader] = value ? parseInt(value) || 1 : 1;
        } else {
          employee[mappedHeader] = value || '';
        }
      }
    });

    // Set defaults for missing fields
    if (!employee.name) continue; // Skip rows without name
    
    employee.department = employee.department || 'General';
    employee.role = employee.role || 'Employee';
    employee.status = employee.status || 'Present';
    employee.availability = employee.availability || 'Available';
    employee.category = employee.category || 'Full-time';
    employee.skills = employee.skills || '';
    employee.skillLevel = employee.skillLevel || 1;
    employee.experience = employee.experience || 0;
    employee.performanceRating = employee.performanceRating || 0;

    employees.push(employee);
  }

  return employees;
};

// Parse a CSV line handling quoted values
const parseCSVLine = (line) => {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current);
  return values;
};

export const exportToCSV = (employees) => {
  const headers = [
    'Employee ID',
    'Name',
    'Department',
    'Role',
    'Skills',
    'Skill Level',
    'Experience (years)',
    'Category',
    'Availability',
    'Performance Rating',
    'Status'
  ];

  const rows = employees.map(emp => [
    emp.employeeId || emp.id || '',
    emp.name || '',
    emp.department || '',
    emp.role || '',
    emp.skills || '',
    emp.skillLevel || '',
    emp.experience || 0,
    emp.category || '',
    emp.availability || '',
    emp.performanceRating || 0,
    emp.status || 'Present'
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  return csvContent;
};

export const downloadCSV = (csvContent, filename = 'employees.csv') => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

