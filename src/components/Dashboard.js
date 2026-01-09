import React, { useState, useEffect } from 'react';
import { getEmployees } from '../utils/api';

const Dashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    departments: 0,
    attendanceRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const empData = await getEmployees();
        setEmployees(empData);

        // Calculate statistics
        const total = empData.length;
        const departments = new Set(empData.map(emp => emp.department)).size;
        // Note: status field might not exist in backend, using availability as fallback
        const presentCount = empData.filter(emp => 
          emp.status === 'Present' || emp.availability === 'Available'
        ).length;
        const attendanceRate = total > 0 ? Math.round((presentCount / total) * 100) : 0;

        setStats({
          totalEmployees: total,
          departments: departments,
          attendanceRate: attendanceRate,
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    
    // Refresh every 5 seconds
    const interval = setInterval(loadData, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      <header className="header">
        <h1>Dashboard</h1>
        <div className="user">👤 Admin</div>
      </header>

      {loading ? (
        <div className="cards">
          <div className="card blue skeleton-card">
            <div className="skeleton skeleton-title" style={{ background: 'rgba(255,255,255,0.3)' }}></div>
            <div className="skeleton" style={{ height: '40px', background: 'rgba(255,255,255,0.3)' }}></div>
          </div>
          <div className="card green skeleton-card">
            <div className="skeleton skeleton-title" style={{ background: 'rgba(255,255,255,0.3)' }}></div>
            <div className="skeleton" style={{ height: '40px', background: 'rgba(255,255,255,0.3)' }}></div>
          </div>
          <div className="card orange skeleton-card">
            <div className="skeleton skeleton-title" style={{ background: 'rgba(255,255,255,0.3)' }}></div>
            <div className="skeleton" style={{ height: '40px', background: 'rgba(255,255,255,0.3)' }}></div>
          </div>
        </div>
      ) : (
        <div className="cards">
          <div className="card blue">
            <h3>Total Employees</h3>
            <p>{stats.totalEmployees}</p>
          </div>
          <div className="card green">
            <h3>Departments</h3>
            <p>{stats.departments}</p>
          </div>
          <div className="card orange">
            <h3>Attendance Rate</h3>
            <p>{stats.attendanceRate}%</p>
          </div>
        </div>
      )}

      <div className="welcome">
        <h2>Welcome to AI Based HR Management System</h2>
        <p>Manage employees, attendance, Team Formation all in one place</p>
      </div>
    </>
  );
};

export default Dashboard;

