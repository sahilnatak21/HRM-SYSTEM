import React, { useState, useEffect } from 'react';
import { getEmployees } from '../utils/api';

const TeamFormation = () => {
  const [employees, setEmployees] = useState([]);
  const [teams, setTeams] = useState([]);
  const [formData, setFormData] = useState({
    teamName: '',
    projectName: '',
    teamSize: 4,
    primarySkills: '',
    secondarySkills: '',
    minExperience: 0,
    employeeCategory: '',
    projectPriority: 'Medium',
  });
  const [generatedTeam, setGeneratedTeam] = useState(null);
  const [showForm, setShowForm] = useState(true);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const empData = await getEmployees();
        setEmployees(empData);
      } catch (error) {
        console.error('Error loading employees:', error);
      }
    };

    loadEmployees();
    const interval = setInterval(loadEmployees, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'teamSize' || name === 'minExperience' 
        ? (value === '' ? '' : parseFloat(value)) 
        : value,
    });
  };

  const getEmployeeCategory = (experience, skillLevel) => {
    if (experience < 1 || skillLevel < 3) return 'Intern';
    if (experience < 3 || skillLevel < 5) return 'Junior';
    if (experience < 6 || skillLevel < 7) return 'Mid-level';
    return 'Senior';
  };

  const calculateMatchScore = (employee, criteria) => {
    let score = 0;
    const maxScore = 100;

    // Experience match (30 points)
    if (employee.experience >= criteria.minExperience) {
      score += 30;
    } else {
      score += Math.max(0, (employee.experience / criteria.minExperience) * 30);
    }

    // Category match (20 points)
    const empCategory = getEmployeeCategory(employee.experience || 0, employee.skillLevel || 1);
    if (empCategory === criteria.employeeCategory || !criteria.employeeCategory) {
      score += 20;
    } else {
      // Partial match for similar categories
      const categoryHierarchy = ['Intern', 'Junior', 'Mid-level', 'Senior'];
      const empIndex = categoryHierarchy.indexOf(empCategory);
      const reqIndex = categoryHierarchy.indexOf(criteria.employeeCategory);
      if (Math.abs(empIndex - reqIndex) === 1) {
        score += 10;
      }
    }

    // Primary skills match (30 points)
    if (criteria.primarySkills) {
      const primarySkillsList = criteria.primarySkills.toLowerCase().split(',').map(s => s.trim());
      const empSkills = (employee.skills || '').toLowerCase();
      const matchingPrimary = primarySkillsList.filter(skill => empSkills.includes(skill));
      score += (matchingPrimary.length / primarySkillsList.length) * 30;
    } else {
      score += 30;
    }

    // Secondary skills match (10 points)
    if (criteria.secondarySkills) {
      const secondarySkillsList = criteria.secondarySkills.toLowerCase().split(',').map(s => s.trim());
      const empSkills = (employee.skills || '').toLowerCase();
      const matchingSecondary = secondarySkillsList.filter(skill => empSkills.includes(skill));
      score += (matchingSecondary.length / secondarySkillsList.length) * 10;
    } else {
      score += 10;
    }

    // Availability bonus (10 points)
    if (employee.availability === 'Available') {
      score += 10;
    } else if (employee.availability === 'Busy') {
      score += 5;
    }

    // Performance rating bonus (up to 10 points)
    if (employee.performanceRating) {
      score += (employee.performanceRating / 10) * 10;
    }

    return Math.min(score, maxScore);
  };

  const generateTeam = (e) => {
    e.preventDefault();

    if (!formData.teamName || !formData.projectName) {
      alert('Please fill in Team Name and Project Name');
      return;
    }

    if (employees.length === 0) {
      alert('Please add employees first!');
      return;
    }

    if (formData.teamSize < 2 || formData.teamSize > employees.length) {
      alert(`Team size must be between 2 and ${employees.length}`);
      return;
    }

    // Filter and score employees based on criteria
    const eligibleEmployees = employees
      .filter(emp => {
        // Basic availability check
        if (emp.availability === 'Unavailable' || emp.availability === 'On Leave') {
          return false;
        }

        // Experience check
        if (formData.minExperience > 0 && (emp.experience || 0) < formData.minExperience) {
          return false;
        }

        // Category check
        if (formData.employeeCategory) {
          const empCategory = getEmployeeCategory(emp.experience || 0, emp.skillLevel || 1);
          if (empCategory !== formData.employeeCategory) {
            return false;
          }
        }

        return true;
      })
      .map(emp => ({
        ...emp,
        matchScore: calculateMatchScore(emp, formData),
        category: getEmployeeCategory(emp.experience || 0, emp.skillLevel || 1),
      }))
      .sort((a, b) => b.matchScore - a.matchScore);

    if (eligibleEmployees.length < formData.teamSize) {
      alert(`Only ${eligibleEmployees.length} eligible employees found. Please adjust your criteria.`);
      return;
    }

    // Select best matching employees
    const selectedTeam = eligibleEmployees.slice(0, formData.teamSize);

    // Calculate team statistics
    const avgExperience = selectedTeam.reduce((sum, emp) => sum + (emp.experience || 0), 0) / selectedTeam.length;
    const avgSkillLevel = selectedTeam.reduce((sum, emp) => sum + (emp.skillLevel || 1), 0) / selectedTeam.length;
    const avgPerformance = selectedTeam.reduce((sum, emp) => sum + (emp.performanceRating || 0), 0) / selectedTeam.length;
    const avgMatchScore = selectedTeam.reduce((sum, emp) => sum + emp.matchScore, 0) / selectedTeam.length;

    const teamData = {
      ...formData,
      members: selectedTeam,
      statistics: {
        avgExperience: avgExperience.toFixed(1),
        avgSkillLevel: avgSkillLevel.toFixed(1),
        avgPerformance: avgPerformance.toFixed(1),
        avgMatchScore: avgMatchScore.toFixed(1),
        totalMembers: selectedTeam.length,
      },
      createdAt: new Date().toISOString(),
    };

    setGeneratedTeam(teamData);
    setShowForm(false);
  };

  const resetForm = () => {
    setFormData({
      teamName: '',
      projectName: '',
      teamSize: 4,
      primarySkills: '',
      secondarySkills: '',
      minExperience: 0,
      employeeCategory: '',
      projectPriority: 'Medium',
    });
    setGeneratedTeam(null);
    setShowForm(true);
  };

  const employeeCategories = ['Intern', 'Junior', 'Mid-level', 'Senior'];
  const priorities = ['High', 'Medium', 'Low'];

  return (
    <>
      <header className="header">
        <h1>AI Team Formation</h1>
        <div className="user">👤 Admin</div>
      </header>

      {showForm && (
        <form className="employee-form" onSubmit={generateTeam} style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
          <h2 style={{ marginBottom: '20px', color: '#004aad', fontSize: '22px', textAlign: 'center' }}>
            Create New Team
          </h2>

          <label htmlFor="teamName">
            Team Name: <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            id="teamName"
            name="teamName"
            value={formData.teamName}
            onChange={handleChange}
            required
            placeholder="Enter team name (e.g., Alpha Team)"
          />

          <label htmlFor="projectName">
            Project Name: <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            id="projectName"
            name="projectName"
            value={formData.projectName}
            onChange={handleChange}
            required
            placeholder="Enter project name"
          />

          <label htmlFor="teamSize">
            Team Size: <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="number"
            id="teamSize"
            name="teamSize"
            value={formData.teamSize}
            onChange={handleChange}
            required
            min="2"
            max={employees.length || 20}
            placeholder="Number of team members"
          />

          <label htmlFor="primarySkills">Required Primary Skills:</label>
          <input
            type="text"
            id="primarySkills"
            name="primarySkills"
            value={formData.primarySkills}
            onChange={handleChange}
            placeholder="Comma-separated (e.g., JavaScript, React, Node.js)"
          />

          <label htmlFor="secondarySkills">Required Secondary Skills:</label>
          <input
            type="text"
            id="secondarySkills"
            name="secondarySkills"
            value={formData.secondarySkills}
            onChange={handleChange}
            placeholder="Comma-separated (optional)"
          />

          <label htmlFor="minExperience">Minimum Experience (years):</label>
          <input
            type="number"
            id="minExperience"
            name="minExperience"
            value={formData.minExperience}
            onChange={handleChange}
            min="0"
            step="0.5"
            placeholder="Minimum years of experience"
          />

          <label htmlFor="employeeCategory">Employee Category:</label>
          <select
            id="employeeCategory"
            name="employeeCategory"
            value={formData.employeeCategory}
            onChange={handleChange}
          >
            <option value="">Any Category</option>
            {employeeCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <label htmlFor="projectPriority">
            Project Priority: <span style={{ color: 'red' }}>*</span>
          </label>
          <select
            id="projectPriority"
            name="projectPriority"
            value={formData.projectPriority}
            onChange={handleChange}
            required
          >
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>

          <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
            <button type="submit" className="generate-team-btn" style={{ flex: 1 }}>
              🚀 Generate Team
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  teamName: '',
                  projectName: '',
                  teamSize: 4,
                  primarySkills: '',
                  secondarySkills: '',
                  minExperience: 0,
                  employeeCategory: '',
                  projectPriority: 'Medium',
                });
              }}
              style={{
                background: '#6c757d',
                padding: '14px 20px',
                flex: 0.5,
              }}
            >
              Reset
            </button>
          </div>
        </form>
      )}

      {generatedTeam && (
        <div className="result-box" style={{ marginTop: '20px', margin: '20px auto 0 auto', maxWidth: '1200px', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ color: '#004aad', fontSize: '24px' }}>
              {generatedTeam.teamName}
            </h2>
            <button onClick={resetForm} style={{ background: '#6c757d' }}>
              Create New Team
            </button>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px',
            borderRadius: '12px',
            color: 'white',
            marginBottom: '25px',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>Project</div>
                <div style={{ fontSize: '18px', fontWeight: '600' }}>{generatedTeam.projectName}</div>
              </div>
              <div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>Priority</div>
                <div style={{ fontSize: '18px', fontWeight: '600' }}>
                  {generatedTeam.projectPriority === 'High' && '🔴'}
                  {generatedTeam.projectPriority === 'Medium' && '🟡'}
                  {generatedTeam.projectPriority === 'Low' && '🟢'}
                  {' '}{generatedTeam.projectPriority}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>Team Size</div>
                <div style={{ fontSize: '18px', fontWeight: '600' }}>{generatedTeam.statistics.totalMembers} members</div>
              </div>
              <div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>Avg Match Score</div>
                <div style={{ fontSize: '18px', fontWeight: '600' }}>{generatedTeam.statistics.avgMatchScore}%</div>
              </div>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            marginBottom: '25px',
          }}>
            <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '10px' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Avg Experience</div>
              <div style={{ fontSize: '20px', fontWeight: '600', color: '#004aad' }}>
                {generatedTeam.statistics.avgExperience} yrs
              </div>
            </div>
            <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '10px' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Avg Skill Level</div>
              <div style={{ fontSize: '20px', fontWeight: '600', color: '#004aad' }}>
                {generatedTeam.statistics.avgSkillLevel}/10
              </div>
            </div>
            <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '10px' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Avg Performance</div>
              <div style={{ fontSize: '20px', fontWeight: '600', color: '#004aad' }}>
                {generatedTeam.statistics.avgPerformance}/10
              </div>
            </div>
          </div>

          <h3 style={{ marginBottom: '15px', color: '#333', fontSize: '18px' }}>Team Members</h3>
          <div className="team-grid">
            {generatedTeam.members.map((member, index) => (
              <div key={member.id || index} className="team-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>{member.name}</h3>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.3)',
                    fontSize: '12px',
                    fontWeight: '600',
                  }}>
                    {member.matchScore.toFixed(0)}% match
                  </span>
                </div>
                <div className="team-member">
                  <div><strong>Role:</strong> {member.role}</div>
                  <div><strong>Department:</strong> {member.department}</div>
                  <div><strong>Category:</strong> {member.category}</div>
                  <div><strong>Experience:</strong> {member.experience || 0} years</div>
                  <div><strong>Skill Level:</strong> {member.skillLevel || 1}/10</div>
                  {member.skills && (
                    <div style={{ marginTop: '8px' }}>
                      <strong>Skills:</strong> {member.skills}
                    </div>
                  )}
                  {member.performanceRating && (
                    <div style={{ marginTop: '4px' }}>
                      <strong>Performance:</strong> {member.performanceRating.toFixed(1)}/10
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </>
  );
};

export default TeamFormation;
