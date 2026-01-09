# HR Management System - React Application

A modern, responsive HR Management System built with React. This application provides a comprehensive solution for managing employees, tracking attendance, and forming teams.

## Features

- 📊 **Dashboard**: View key statistics including total employees, departments, and attendance rate
- 👥 **Employee Management**: Add, view, and delete employees with search and filter capabilities
- 🕒 **Attendance Tracking**: Track and toggle employee attendance status
- 🤝 **Team Formation**: AI-powered team generation with customizable team sizes
- 📱 **Responsive Design**: Fully responsive and mobile-friendly interface
- 🎨 **Modern UI**: Interactive components with smooth animations and transitions

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Project Structure

```
src/
  ├── components/
  │   ├── Sidebar.js          # Navigation sidebar
  │   ├── Dashboard.js        # Dashboard component
  │   ├── Employees.js        # Employee list component
  │   ├── AddEmployee.js      # Add employee form
  │   ├── Attendance.js       # Attendance tracking
  │   └── TeamFormation.js    # Team generation
  ├── utils/
  │   └── storage.js          # LocalStorage utilities
  ├── App.js                  # Main app component with routing
  ├── App.css                 # Main styles
  └── index.js                # Entry point
```

## Technologies Used

- **React 18**: UI library
- **React Router**: Navigation and routing
- **LocalStorage**: Data persistence
- **CSS3**: Styling with animations and responsive design

## Features in Detail

### Dashboard
- Real-time statistics
- Total employee count
- Department count
- Attendance rate calculation

### Employee Management
- Add new employees with department and role
- View all employees in a searchable table
- Filter by department
- Delete employees with confirmation

### Attendance Tracking
- View present/absent counts
- Toggle employee attendance status
- Real-time attendance rate calculation
- Search functionality

### Team Formation
- Generate balanced teams
- Customizable team size
- Department-based distribution
- Visual team cards

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is open source and available for personal and commercial use.

