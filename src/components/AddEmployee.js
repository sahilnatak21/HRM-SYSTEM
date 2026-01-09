import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEmployee, createEmployees } from '../utils/api';
import { parseCSV, exportToCSV, downloadCSV } from '../utils/csvParser';
import { toast } from '../utils/toast';

const AddEmployee = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    department: '',
    role: '',
    skills: '',
    skillLevel: 1,
    experience: 0,
    category: 'Full-time',
    availability: 'Available',
    performanceRating: 0,
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [csvError, setCsvError] = useState('');
  const [csvSuccess, setCsvSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const departments = [
    'Engineering',
    'Marketing',
    'Sales',
    'HR',
    'Finance',
    'Operations',
    'IT',
    'Design',
  ];

  const categories = [
    'Full-time',
    'Part-time',
    'Contract',
    'Intern',
    'Freelance',
  ];

  const availabilityOptions = [
    'Available',
    'Busy',
    'On Leave',
    'Unavailable',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'skillLevel' || name === 'experience' || name === 'performanceRating' 
        ? parseFloat(value) || 0 
        : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!formData.name || !formData.department || !formData.role) {
      setError('Please fill in required fields (Name, Department, Role)');
      setLoading(false);
      return;
    }

    try {
      await createEmployee(formData);
      toast.success('Employee added successfully!');
      setShowSuccess(true);
      setSuccessMessage('Employee added successfully! Redirecting to employee list...');
      setFormData({
        employeeId: '',
        name: '',
        department: '',
        role: '',
        skills: '',
        skillLevel: 1,
        experience: 0,
        category: 'Full-time',
        availability: 'Available',
        performanceRating: 0,
      });

      setTimeout(() => {
        setShowSuccess(false);
        navigate('/employees');
      }, 2000);
    } catch (error) {
      const errorMsg = error.message || 'Failed to add employee. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('Error adding employee:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setCsvError('Please upload a CSV file');
      setCsvSuccess('');
      return;
    }

    setCsvError('');
    setCsvSuccess('');
    setLoading(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csvText = event.target.result;
        const employees = parseCSV(csvText);
        
        if (employees.length === 0) {
          setCsvError('No valid employee data found in CSV file');
          setLoading(false);
          return;
        }

        const created = await createEmployees(employees);
        const successMsg = `Successfully imported ${created.length} employee(s)!`;
        setCsvSuccess(successMsg);
        toast.success(successMsg);
        
        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        setTimeout(() => {
          navigate('/employees');
        }, 2000);
      } catch (error) {
        const errorMsg = `Error importing CSV: ${error.message}`;
        setCsvError(errorMsg);
        toast.error(errorMsg);
        console.error('Error importing CSV:', error);
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setCsvError('Error reading file');
      setLoading(false);
    };

    reader.readAsText(file);
  };

  return (
    <>
      <header className="header">
        <h1>Add New Employee</h1>
        <div className="user">👤 Admin</div>
      </header>

      {/* CSV Upload Section */}
      <div style={{ 
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(250, 251, 255, 0.98) 100%)', 
        padding: '35px', 
        borderRadius: '16px', 
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05)',
        marginBottom: '30px',
        maxWidth: '800px',
        width: '100%',
        margin: '0 0 30px 0',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        boxSizing: 'border-box'
      }}>
        <h2 style={{ marginBottom: '12px', color: '#004aad', fontSize: '22px', fontWeight: '600', textAlign: 'center' }}>
          📁 Upload Employee Data (CSV)
        </h2>
        <p style={{ marginBottom: '20px', color: '#666', fontSize: '14px', lineHeight: '1.6', textAlign: 'center' }}>
          Upload a CSV file with employee data. Expected columns: Employee ID, Name, Skills, Skill Level, Experience (years), Category, Availability, Performance Rating, Department, Role
        </p>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            style={{
              padding: '10px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontFamily: 'Poppins, sans-serif',
              flex: '0 1 auto',
              minWidth: '200px',
              maxWidth: '400px',
              cursor: 'pointer'
            }}
          />
          <button
            type="button"
            onClick={() => {
              const template = 'Employee ID,Name,Skills,Skill Level,Experience (years),Category,Availability,Performance Rating,Department,Role\nEMP001,John Doe,JavaScript React Node.js,8,5,Full-time,Available,8.5,Engineering,Software Engineer\nEMP002,Jane Smith,Python Django SQL,7,3,Full-time,Available,7.8,Engineering,Backend Developer';
              downloadCSV(template, 'employee_template.csv');
            }}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '10px 20px',
              fontSize: '14px',
              whiteSpace: 'nowrap',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            📄 Download Template
          </button>
        </div>
        {csvError && (
          <div style={{
            marginTop: '10px',
            padding: '12px',
            background: '#f8d7da',
            color: '#721c24',
            borderRadius: '8px',
            borderLeft: '4px solid #dc3545',
            width: '100%',
            textAlign: 'left',
            boxSizing: 'border-box'
          }}>
            ❌ {csvError}
          </div>
        )}
        {csvSuccess && (
          <div style={{
            marginTop: '10px',
            padding: '12px',
            background: '#d4edda',
            color: '#155724',
            borderRadius: '8px',
            borderLeft: '4px solid #28a745',
            width: '100%',
            textAlign: 'left',
            boxSizing: 'border-box'
          }}>
            ✅ {csvSuccess}
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{
        textAlign: 'center',
        margin: '35px 0',
        color: '#666',
        fontSize: '16px',
        fontWeight: '500',
        maxWidth: '650px',
        width: '100%',
        position: 'relative',
        boxSizing: 'border-box'
      }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(to right, transparent, #ddd, transparent)',
          zIndex: 0
        }}></div>
        <span style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(240, 245, 255, 0.8) 100%)',
          padding: '0 25px',
          position: 'relative',
          zIndex: 1
        }}>OR</span>
      </div>

      {showSuccess && (
        <div className="success-message" style={{
          margin: '0 0 20px 0',
          width: '100%',
          maxWidth: '650px',
          boxSizing: 'border-box'
        }}>
          ✅ {successMessage}
        </div>
      )}

      {error && (
        <div style={{
          marginBottom: '20px',
          padding: '12px',
          background: '#f8d7da',
          color: '#721c24',
          borderRadius: '8px',
          borderLeft: '4px solid #dc3545',
          width: '100%',
          maxWidth: '650px',
          boxSizing: 'border-box'
        }}>
          ❌ {error}
        </div>
      )}

      <form className="employee-form" onSubmit={handleSubmit}>
        <h2 style={{ marginBottom: '20px', color: '#004aad', fontSize: '20px' }}>
          Add Employee Manually
        </h2>

        <label htmlFor="employeeId">Employee ID:</label>
        <input
          type="text"
          id="employeeId"
          name="employeeId"
          value={formData.employeeId}
          onChange={handleChange}
          placeholder="Enter employee ID (optional)"
        />

        <label htmlFor="name">Full Name: <span style={{ color: 'red' }}>*</span></label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Enter employee name"
        />

        <label htmlFor="department">Department: <span style={{ color: 'red' }}>*</span></label>
        <select
          id="department"
          name="department"
          value={formData.department}
          onChange={handleChange}
          required
        >
          <option value="">Select Department</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>

        <label htmlFor="role">Role: <span style={{ color: 'red' }}>*</span></label>
        <input
          type="text"
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
          placeholder="Enter role (e.g., Software Engineer, Manager)"
        />

        <label htmlFor="skills">Skills:</label>
        <input
          type="text"
          id="skills"
          name="skills"
          value={formData.skills}
          onChange={handleChange}
          placeholder="Enter skills (comma-separated, e.g., JavaScript, React, Node.js)"
        />

        <label htmlFor="skillLevel">Skill Level (1-10):</label>
        <input
          type="number"
          id="skillLevel"
          name="skillLevel"
          value={formData.skillLevel}
          onChange={handleChange}
          min="1"
          max="10"
          placeholder="Enter skill level"
        />

        <label htmlFor="experience">Experience (years):</label>
        <input
          type="number"
          id="experience"
          name="experience"
          value={formData.experience}
          onChange={handleChange}
          min="0"
          step="0.5"
          placeholder="Enter years of experience"
        />

        <label htmlFor="category">Category:</label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <label htmlFor="availability">Availability:</label>
        <select
          id="availability"
          name="availability"
          value={formData.availability}
          onChange={handleChange}
        >
          {availabilityOptions.map((avail) => (
            <option key={avail} value={avail}>
              {avail}
            </option>
          ))}
        </select>

        <label htmlFor="performanceRating">Performance Rating (0-10):</label>
        <input
          type="number"
          id="performanceRating"
          name="performanceRating"
          value={formData.performanceRating}
          onChange={handleChange}
          min="0"
          max="10"
          step="0.1"
          placeholder="Enter performance rating"
        />

        <button type="submit" disabled={loading}>
          {loading ? (
            <>
              <span className="loading-spinner"></span>
              Adding...
            </>
          ) : (
            'Add Employee'
          )}
        </button>
      </form>
    </>
  );
};

export default AddEmployee;

