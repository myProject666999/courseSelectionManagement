import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import StudentProfile from './StudentProfile';
import CourseSelection from './CourseSelection';
import MySelections from './MySelections';

type TabType = 'profile' | 'schedules' | 'myselections';

const StudentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  const tabs: { key: TabType; label: string }[] = [
    { key: 'profile', label: '我的信息' },
    { key: 'schedules', label: '选择课程' },
    { key: 'myselections', label: '我的选课' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <StudentProfile />;
      case 'schedules':
        return <CourseSelection />;
      case 'myselections':
        return <MySelections />;
      default:
        return null;
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>学生选课管理系统 - 学生</h1>
        <div style={styles.userInfo}>
          <span style={styles.userName}>欢迎, {user?.name || user?.student_id || user?.username}</span>
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
    backgroundColor: '#17a2b8',
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
    backgroundColor: '#e0f7fa',
    color: '#17a2b8',
    borderLeft: '3px solid #17a2b8',
  },
  content: {
    flex: 1,
    padding: '20px',
  },
};

export default StudentDashboard;
