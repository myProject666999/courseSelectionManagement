import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import type { Teacher } from '../../types';

const TeacherProfile: React.FC = () => {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/teacher/info');
      setTeacher(response.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (newPassword !== confirmPassword) {
      setMessage({ text: '两次输入的新密码不一致', type: 'error' });
      return;
    }

    try {
      await api.post('/teacher/change-password', {
        old_password: oldPassword,
        new_password: newPassword,
      });
      setMessage({ text: '密码修改成功', type: 'success' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setMessage({ text: err.response?.data?.error || '密码修改失败', type: 'error' });
    }
  };

  return (
    <div>
      <h2 style={styles.title}>我的信息</h2>
      
      {teacher && (
        <div style={styles.card}>
          <div style={styles.infoRow}>
            <span style={styles.label}>用户名:</span>
            <span style={styles.value}>{teacher.username}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.label}>姓名:</span>
            <span style={styles.value}>{teacher.name || '-'}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.label}>院系:</span>
            <span style={styles.value}>{teacher.department || '-'}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.label}>职称:</span>
            <span style={styles.value}>{teacher.title || '-'}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.label}>电话:</span>
            <span style={styles.value}>{teacher.phone || '-'}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.label}>邮箱:</span>
            <span style={styles.value}>{teacher.email || '-'}</span>
          </div>
        </div>
      )}

      <h2 style={styles.title}>修改密码</h2>
      <form onSubmit={handleChangePassword} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>原密码</label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            style={styles.input}
            required
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>新密码</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={styles.input}
            required
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>确认新密码</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={styles.input}
            required
          />
        </div>
        {message.text && (
          <div style={{
            ...styles.message,
            color: message.type === 'success' ? 'green' : 'red',
          }}>
            {message.text}
          </div>
        )}
        <button type="submit" style={styles.button}>
          修改密码
        </button>
      </form>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  title: {
    fontSize: '18px',
    marginBottom: '20px',
    color: '#333',
  },
  card: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '30px',
    maxWidth: '500px',
  },
  infoRow: {
    display: 'flex',
    marginBottom: '12px',
  },
  label: {
    width: '100px',
    fontWeight: '500',
    color: '#666',
  },
  value: {
    color: '#333',
  },
  form: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    maxWidth: '500px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    marginTop: '5px',
    boxSizing: 'border-box',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  message: {
    marginBottom: '15px',
    fontSize: '14px',
  },
};

export default TeacherProfile;
