import React, { useState, useEffect } from 'react';
import { getEmployees, updateEmployee } from '../utils/api';
import { toast } from '../utils/toast';

const Attendance = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoading(true);
        const empData = await getEmployees();
        setEmployees(empData);
      } catch (error) {
        console.error('Error loading employees:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEmployees();
    const interval = setInterval(loadEmployees, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleToggleStatus = async (id) => {
    const employee = employees.find(emp => emp.id === id);
    if (!employee) return;

    const newStatus = employee.status === 'Present' ? 'Absent' : 'Present';
    try {
      await updateEmployee(id, { ...employee, status: newStatus });
      toast.success(`${employee.name} marked as ${newStatus}`);
      // Reload employees after update
      const empData = await getEmployees();
      setEmployees(empData);
    } catch (error) {
      const errorMsg = `Failed to update status: ${error.message}`;
      toast.error(errorMsg);
      console.error('Error updating employee status:', error);
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const presentCount = employees.filter(emp => emp.status === 'Present').length;
  const absentCount = employees.filter(emp => emp.status === 'Absent').length;
  const attendanceRate = employees.length > 0 
    ? Math.round((presentCount / employees.length) * 100) 
    : 0;

  return (
    <>
      <header className="header">
        <h1>Attendance Tracker</h1>
        <div className="user">👤 Admin</div>
      </header>

      <div className="cards" style={{ marginBottom: '30px' }}>
        <div className="card green">
          <h3>Present</h3>
          <p>{presentCount}</p>
        </div>
        <div className="card orange">
          <h3>Absent</h3>
          <p>{absentCount}</p>
        </div>
        <div className="card blue">
          <h3>Attendance Rate</h3>
          <p>{attendanceRate}%</p>
        </div>
      </div>

      <div className="table-container">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '400px',
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
        </div>

        {loading ? (
          <div className="empty-state">
            <h3>Loading employees...</h3>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="empty-state">
            <h3>No employees found</h3>
            <p>Add employees to start tracking attendance.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Department</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.name}</td>
                  <td>{emp.department}</td>
                  <td>
                    <span className={`status-badge ${emp.status === 'Present' ? 'present' : 'absent'}`}>
                      {emp.status || 'Present'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="toggle-btn"
                      onClick={() => handleToggleStatus(emp.id)}
                    >
                      Toggle Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default Attendance;

