import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminManagement from './AdminManagement';
import CourseManagement from './CourseManagement';
import TeacherManagement from './TeacherManagement';
import ScheduleManagement from './ScheduleManagement';
import StudentManagement from './StudentManagement';
import Profile from './Profile';

type TabType = 'profile' | 'admins' | 'courses' | 'teachers' | 'schedules' | 'students';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  const tabs: { key: TabType; label: string }[] = [
    { key: 'profile', label: '个人信息' },
    { key: 'admins', label: '管理员管理' },
    { key: 'courses', label: '课程管理' },
    { key: 'teachers', label: '教师管理' },
    { key: 'schedules', label: '课表管理' },
    { key: 'students', label: '学生管理' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <Profile />;
      case 'admins':
        return <AdminManagement />;
      case 'courses':
        return <CourseManagement />;
      case 'teachers':
        return <TeacherManagement />;
      case 'schedules':
        return <ScheduleManagement />;
      case 'students':
        return <StudentManagement />;
      default:
        return null;
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>学生选课管理系统 - 管理员</h1>
        <div style={styles.userInfo}>
          <span style={styles.userName}>欢迎, {user?.name || user?.username}</span>
          <button onClick={logout} style={styles.logoutButton}>
            退出登录
          </button>
        </div>
      </header>
      <div style={styles.main}>
        <nav style={styles.sidebar}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                ...styles.navButton,
                ...(activeTab === tab.key ? styles.activeNavButton : {}),
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <main style={styles.content}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '15px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    fontSize: '20px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  userName: {
    fontSize: '14px',
  },
  logoutButton: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    border: '1px solid white',
    color: 'white',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  main: {
    display: 'flex',
    minHeight: 'calc(100vh - 60px)',
  },
  sidebar: {
    width: '200px',
    backgroundColor: 'white',
    borderRight: '1px solid #ddd',
    padding: '20px 0',
  },
  navButton: {
    width: '100%',
    padding: '12px 20px',
    textAlign: 'left',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#333',
  },
  activeNavButton: {
    backgroundColor: '#e3f2fd',
    color: '#007bff',
    borderLeft: '3px solid #007bff',
  },
  content: {
    flex: 1,
    padding: '20px',
  },
};

export default AdminDashboard;
