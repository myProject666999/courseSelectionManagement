import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import TeacherProfile from './TeacherProfile';
import TeacherSchedules from './TeacherSchedules';

type TabType = 'profile' | 'schedules';

const TeacherDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  const tabs: { key: TabType; label: string }[] = [
    { key: 'profile', label: '我的信息' },
    { key: 'schedules', label: '课表信息' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <TeacherProfile />;
      case 'schedules':
        return <TeacherSchedules />;
      default:
        return null;
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>学生选课管理系统 - 教师</h1>
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
    backgroundColor: '#28a745',
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
    backgroundColor: '#e8f5e9',
    color: '#28a745',
    borderLeft: '3px solid #28a745',
  },
  content: {
    flex: 1,
    padding: '20px',
  },
};

export default TeacherDashboard;
