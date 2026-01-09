import React, { useState, useEffect } from 'react';
import { getEmployees, deleteEmployee } from '../utils/api';
import { exportToCSV, downloadCSV } from '../utils/csvParser';
import { toast } from '../utils/toast';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoading(true);
        setError('');
        const empData = await getEmployees();
        setEmployees(empData);
      } catch (error) {
        setError('Failed to load employees. Please refresh the page.');
        console.error('Error loading employees:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEmployees();
    // Refresh every 5 seconds to get latest data
    const interval = setInterval(loadEmployees, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteEmployee(id);
        toast.success(`${name} deleted successfully`);
        // Reload employees after deletion
        const empData = await getEmployees();
        setEmployees(empData);
      } catch (error) {
        const errorMsg = `Failed to delete employee: ${error.message}`;
        toast.error(errorMsg);
        console.error('Error deleting employee:', error);
      }
    }
  };

  const handleExportCSV = () => {
    if (employees.length === 0) {
      toast.info('No employees to export');
      return;
    }
    const csvContent = exportToCSV(employees);
    downloadCSV(csvContent, 'employees_export.csv');
    toast.success('CSV exported successfully!');
  };

  const departments = [...new Set(employees.map(emp => emp.department))];

  const filteredEmployees = employees.filter(emp => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      emp.name?.toLowerCase().includes(searchLower) ||
      emp.role?.toLowerCase().includes(searchLower) ||
      emp.employeeId?.toLowerCase().includes(searchLower) ||
      emp.skills?.toLowerCase().includes(searchLower) ||
      emp.department?.toLowerCase().includes(searchLower);
    const matchesDepartment = !filterDepartment || emp.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  return (
    <>
      <header className="header">
        <h1>Employee List</h1>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button 
            onClick={handleExportCSV}
            style={{
              background: 'linear-gradient(135deg, #1cc88a, #17a673)',
              padding: '10px 20px',
              fontSize: '14px'
            }}
          >
            📥 Export CSV
          </button>
          <div className="user">👤 Admin</div>
        </div>
      </header>

      <div className="table-container">
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <input
            type="text"
            placeholder="Search by name, role, ID, skills, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: '1 1 300px',
              maxWidth: '500px',
              minWidth: '200px',
              padding: '12px 15px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '14px',
              transition: 'all 0.3s ease',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#004aad';
              e.target.style.boxShadow = '0 0 0 3px rgba(0, 74, 173, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e0e0e0';
              e.target.style.boxShadow = 'none';
            }}
          />
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            style={{
              padding: '12px 15px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontFamily: 'Poppins, sans-serif',
              minWidth: '180px',
              fontSize: '14px',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#004aad';
              e.target.style.boxShadow = '0 0 0 3px rgba(0, 74, 173, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e0e0e0';
              e.target.style.boxShadow = 'none';
            }}
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="empty-state">
            <h3>Loading employees...</h3>
          </div>
        ) : error ? (
          <div className="empty-state">
            <h3>Error</h3>
            <p>{error}</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="empty-state">
            <h3>No employees found</h3>
            <p>{employees.length === 0 ? 'Add your first employee to get started!' : 'Try adjusting your search or filter.'}</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th>Skills</th>
                  <th>Skill Level</th>
                  <th>Experience</th>
                  <th>Category</th>
                  <th>Availability</th>
                  <th>Performance</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id}>
                    <td>{emp.employeeId || emp.id || 'N/A'}</td>
                    <td><strong>{emp.name}</strong></td>
                    <td>{emp.department}</td>
                    <td>{emp.role}</td>
                    <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {emp.skills || '-'}
                    </td>
                    <td>
                      {emp.skillLevel ? (
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          background: emp.skillLevel >= 7 ? '#d4edda' : emp.skillLevel >= 4 ? '#fff3cd' : '#f8d7da',
                          color: emp.skillLevel >= 7 ? '#155724' : emp.skillLevel >= 4 ? '#856404' : '#721c24',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {emp.skillLevel}/10
                        </span>
                      ) : '-'}
                    </td>
                    <td>{emp.experience ? `${emp.experience} yrs` : '-'}</td>
                    <td>{emp.category || '-'}</td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        background: emp.availability === 'Available' ? '#d4edda' : 
                                   emp.availability === 'Busy' ? '#fff3cd' : '#f8d7da',
                        color: emp.availability === 'Available' ? '#155724' : 
                               emp.availability === 'Busy' ? '#856404' : '#721c24',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {emp.availability || 'Available'}
                      </span>
                    </td>
                    <td>
                      {emp.performanceRating ? (
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          background: emp.performanceRating >= 7 ? '#d4edda' : emp.performanceRating >= 4 ? '#fff3cd' : '#f8d7da',
                          color: emp.performanceRating >= 7 ? '#155724' : emp.performanceRating >= 4 ? '#856404' : '#721c24',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {emp.performanceRating.toFixed(1)}/10
                        </span>
                      ) : '-'}
                    </td>
                    <td>
                      <span className={`status-badge ${emp.status === 'Present' ? 'present' : 'absent'}`}>
                        {emp.status || 'Present'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(emp.id, emp.name)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default Employees;

