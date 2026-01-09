// API service for backend communication
const API_BASE_URL = 'http://localhost:8080/api/employees';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Get all employees
export const getEmployees = async () => {
  try {
    const response = await fetch(API_BASE_URL);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw error;
  }
};

// Get employee by ID
export const getEmployeeById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching employee:', error);
    throw error;
  }
};

// Create a new employee
export const createEmployee = async (employeeData) => {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(employeeData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error creating employee:', error);
    throw error;
  }
};

// Create multiple employees (for CSV import)
export const createEmployees = async (employeesList) => {
  try {
    // Create employees one by one (or you can create a bulk endpoint in backend)
    const results = await Promise.allSettled(
      employeesList.map(emp => createEmployee(emp))
    );
    
    const successful = results.filter(r => r.status === 'fulfilled').map(r => r.value);
    const failed = results.filter(r => r.status === 'rejected');
    
    if (failed.length > 0) {
      console.warn(`${failed.length} employees failed to create`);
    }
    
    return successful;
  } catch (error) {
    console.error('Error creating employees:', error);
    throw error;
  }
};

// Update an employee
export const updateEmployee = async (id, employeeData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(employeeData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error updating employee:', error);
    throw error;
  }
};

// Delete an employee
export const deleteEmployee = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error('Error deleting employee:', error);
    throw error;
  }
};

