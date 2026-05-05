import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import type { Admin } from '../../types';

const AdminManagement: React.FC = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [newAdmin, setNewAdmin] = useState({
    username: '',
    password: '',
    name: '',
  });
  const [editAdmin, setEditAdmin] = useState({
    username: '',
    name: '',
  });
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await api.get('/admin/admins');
      setAdmins(response.data);
    } catch (error) {
      console.error('Failed to fetch admins:', error);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    try {
      await api.post('/admin/admins', newAdmin);
      setMessage({ text: '管理员创建成功', type: 'success' });
      setShowAddModal(false);
      setNewAdmin({ username: '', password: '', name: '' });
      fetchAdmins();
    } catch (err: any) {
      setMessage({ text: err.response?.data?.error || '创建失败', type: 'error' });
    }
  };

  const handleEditAdmin = (admin: Admin) => {
    setSelectedAdmin(admin);
    setEditAdmin({
      username: admin.username,
      name: admin.name || '',
    });
    setMessage({ text: '', type: '' });
    setShowEditModal(true);
  };

  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (!selectedAdmin) return;

    try {
      await api.put(`/admin/admins/${selectedAdmin.id}`, editAdmin);
      setMessage({ text: '管理员更新成功', type: 'success' });
      setShowEditModal(false);
      setSelectedAdmin(null);
      fetchAdmins();
    } catch (err: any) {
      setMessage({ text: err.response?.data?.error || '更新失败', type: 'error' });
    }
  };

  const handleResetPassword = (admin: Admin) => {
    setSelectedAdmin(admin);
    setNewPassword('');
    setMessage({ text: '', type: '' });
    setShowResetModal(true);
  };

  const handleConfirmResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (!selectedAdmin || !newPassword) return;

    try {
      await api.post(`/admin/admins/${selectedAdmin.id}/reset-password`, {
        new_password: newPassword,
      });
      setMessage({ text: '密码重置成功', type: 'success' });
      setShowResetModal(false);
      setSelectedAdmin(null);
      setNewPassword('');
    } catch (err: any) {
      setMessage({ text: err.response?.data?.error || '密码重置失败', type: 'error' });
    }
  };

  const handleDeleteAdmin = async (id: number) => {
    if (!window.confirm('确定要删除该管理员吗？')) {
      return;
    }

    try {
      await api.delete(`/admin/admins/${id}`);
      fetchAdmins();
    } catch (err: any) {
      alert(err.response?.data?.error || '删除失败');
    }
  };

  return (
    <div>
      <div style={styles.header}>
        <h2 style={styles.title}>管理员管理</h2>
        <button
          onClick={() => setShowAddModal(true)}
          style={styles.addButton}
        >
          + 添加管理员
        </button>
      </div>

      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHeader}>
            <th style={styles.tableCell}>ID</th>
            <th style={styles.tableCell}>用户名</th>
            <th style={styles.tableCell}>姓名</th>
            <th style={styles.tableCell}>创建时间</th>
            <th style={styles.tableCell}>操作</th>
          </tr>
        </thead>
        <tbody>
          {admins.map((admin) => (
            <tr key={admin.id} style={styles.tableRow}>
              <td style={styles.tableCell}>{admin.id}</td>
              <td style={styles.tableCell}>{admin.username}</td>
              <td style={styles.tableCell}>{admin.name || '-'}</td>
              <td style={styles.tableCell}>
                {new Date(admin.created_at).toLocaleString()}
              </td>
              <td style={styles.tableCell}>
                <button
                  onClick={() => handleEditAdmin(admin)}
                  style={styles.editButton}
                >
                  编辑
                </button>
                <button
                  onClick={() => handleResetPassword(admin)}
                  style={styles.resetButton}
                >
                  重置密码
                </button>
                <button
                  onClick={() => handleDeleteAdmin(admin.id)}
                  style={styles.deleteButton}
                >
                  删除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {admins.length === 0 && (
        <div style={styles.empty}>暂无管理员数据</div>
      )}

      {showAddModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>添加管理员</h3>
            <form onSubmit={handleCreateAdmin}>
              <div style={styles.formGroup}>
                <label style={styles.label}>用户名 *</label>
                <input
                  type="text"
                  value={newAdmin.username}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, username: e.target.value })
                  }
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>密码 *</label>
                <input
                  type="password"
                  value={newAdmin.password}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, password: e.target.value })
                  }
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>姓名</label>
                <input
                  type="text"
                  value={newAdmin.name}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, name: e.target.value })
                  }
                  style={styles.input}
                />
              </div>
              {message.text && (
                <div
                  style={{
                    ...styles.message,
                    color: message.type === 'success' ? 'green' : 'red',
                  }}
                >
                  {message.text}
                </div>
              )}
              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setMessage({ text: '', type: '' });
                  }}
                  style={styles.cancelButton}
                >
                  取消
                </button>
                <button type="submit" style={styles.confirmButton}>
                  确认
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selectedAdmin && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>编辑管理员</h3>
            <form onSubmit={handleUpdateAdmin}>
              <div style={styles.formGroup}>
                <label style={styles.label}>用户名 *</label>
                <input
                  type="text"
                  value={editAdmin.username}
                  onChange={(e) =>
                    setEditAdmin({ ...editAdmin, username: e.target.value })
                  }
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>姓名</label>
                <input
                  type="text"
                  value={editAdmin.name}
                  onChange={(e) =>
                    setEditAdmin({ ...editAdmin, name: e.target.value })
                  }
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  提示：如需修改密码，请使用"重置密码"功能
                </label>
              </div>
              {message.text && (
                <div
                  style={{
                    ...styles.message,
                    color: message.type === 'success' ? 'green' : 'red',
                  }}
                >
                  {message.text}
                </div>
              )}
              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedAdmin(null);
                    setMessage({ text: '', type: '' });
                  }}
                  style={styles.cancelButton}
                >
                  取消
                </button>
                <button type="submit" style={styles.confirmButton}>
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showResetModal && selectedAdmin && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>重置密码 - {selectedAdmin.username}</h3>
            <form onSubmit={handleConfirmResetPassword}>
              <div style={styles.formGroup}>
                <label style={styles.label}>新密码 *</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={styles.input}
                  required
                  placeholder="请输入新密码"
                />
              </div>
              {message.text && (
                <div
                  style={{
                    ...styles.message,
                    color: message.type === 'success' ? 'green' : 'red',
                  }}
                >
                  {message.text}
                </div>
              )}
              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetModal(false);
                    setSelectedAdmin(null);
                    setNewPassword('');
                    setMessage({ text: '', type: '' });
                  }}
                  style={styles.cancelButton}
                >
                  取消
                </button>
                <button type="submit" style={styles.confirmButton}>
                  确认重置
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '18px',
    margin: 0,
    color: '#333',
  },
  addButton: {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  tableHeader: {
    backgroundColor: '#f8f9fa',
  },
  tableCell: {
    padding: '12px 15px',
    textAlign: 'left',
    borderBottom: '1px solid #ddd',
  },
  tableRow: {
    '&:hover': {
      backgroundColor: '#f8f9fa',
    },
  },
  editButton: {
    padding: '5px 10px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    marginRight: '5px',
  },
  resetButton: {
    padding: '5px 10px',
    backgroundColor: '#ffc107',
    color: '#333',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    marginRight: '5px',
  },
  deleteButton: {
    padding: '5px 10px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  empty: {
    textAlign: 'center',
    padding: '40px',
    color: '#999',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    width: '400px',
    maxWidth: '90%',
  },
  modalTitle: {
    marginTop: 0,
    marginBottom: '20px',
    fontSize: '18px',
    color: '#333',
  },
  formGroup: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: '500',
    color: '#555',
    fontSize: '13px',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  message: {
    marginBottom: '15px',
    fontSize: '14px',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px',
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  confirmButton: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
};

export default AdminManagement;
