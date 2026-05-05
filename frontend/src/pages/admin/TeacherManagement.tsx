import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import type { Teacher } from '../../types';

const TeacherManagement: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    department: '',
    title: '',
    phone: '',
    email: '',
  });
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await api.get('/admin/teachers');
      setTeachers(response.data);
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
    }
  };

  const handleAdd = () => {
    setEditMode(false);
    setEditingTeacher(null);
    setFormData({
      username: '',
      password: '',
      name: '',
      department: '',
      title: '',
      phone: '',
      email: '',
    });
    setMessage({ text: '', type: '' });
    setShowModal(true);
  };

  const handleEdit = (teacher: Teacher) => {
    setEditMode(true);
    setEditingTeacher(teacher);
    setFormData({
      username: teacher.username,
      password: '',
      name: teacher.name,
      department: teacher.department,
      title: teacher.title,
      phone: teacher.phone,
      email: teacher.email,
    });
    setMessage({ text: '', type: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    try {
      const submitData = { ...formData };
      if (editMode && !submitData.password) {
        delete (submitData as any).password;
      }

      if (editMode && editingTeacher) {
        await api.put(`/admin/teachers/${editingTeacher.id}`, submitData);
        setMessage({ text: '教师更新成功', type: 'success' });
      } else {
        await api.post('/admin/teachers', submitData);
        setMessage({ text: '教师创建成功', type: 'success' });
      }
      setTimeout(() => {
        setShowModal(false);
        fetchTeachers();
      }, 500);
    } catch (err: any) {
      setMessage({ text: err.response?.data?.error || '操作失败', type: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除该教师吗？')) {
      return;
    }

    try {
      await api.delete(`/admin/teachers/${id}`);
      fetchTeachers();
    } catch (err: any) {
      alert(err.response?.data?.error || '删除失败');
    }
  };

  return (
    <div>
      <div style={styles.header}>
        <h2 style={styles.title}>教师管理</h2>
        <button onClick={handleAdd} style={styles.addButton}>
          + 添加教师
        </button>
      </div>

      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHeader}>
            <th style={styles.tableCell}>用户名</th>
            <th style={styles.tableCell}>姓名</th>
            <th style={styles.tableCell}>院系</th>
            <th style={styles.tableCell}>职称</th>
            <th style={styles.tableCell}>电话</th>
            <th style={styles.tableCell}>邮箱</th>
            <th style={styles.tableCell}>操作</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map((teacher) => (
            <tr key={teacher.id} style={styles.tableRow}>
              <td style={styles.tableCell}>{teacher.username}</td>
              <td style={styles.tableCell}>{teacher.name || '-'}</td>
              <td style={styles.tableCell}>{teacher.department || '-'}</td>
              <td style={styles.tableCell}>{teacher.title || '-'}</td>
              <td style={styles.tableCell}>{teacher.phone || '-'}</td>
              <td style={styles.tableCell}>{teacher.email || '-'}</td>
              <td style={styles.tableCell}>
                <button
                  onClick={() => handleEdit(teacher)}
                  style={styles.editButton}
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(teacher.id)}
                  style={styles.deleteButton}
                >
                  删除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {teachers.length === 0 && (
        <div style={styles.empty}>暂无教师数据</div>
      )}

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>
              {editMode ? '编辑教师' : '添加教师'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>用户名 *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    style={styles.input}
                    required
                  />
                </div>
                {!editMode && (
                  <div style={styles.formGroup}>
                    <label style={styles.label}>密码 *</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      style={styles.input}
                      required={!editMode}
                    />
                  </div>
                )}
              </div>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>姓名</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>院系</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    style={styles.input}
                  />
                </div>
              </div>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>职称</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>电话</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    style={styles.input}
                  />
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>邮箱</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  style={styles.input}
                />
              </div>
              {editMode && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>新密码 (留空则不修改)</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    style={styles.input}
                  />
                </div>
              )}
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
                  onClick={() => setShowModal(false)}
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
    fontSize: '14px',
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
    width: '600px',
    maxWidth: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  modalTitle: {
    marginTop: 0,
    marginBottom: '20px',
    fontSize: '18px',
    color: '#333',
  },
  formRow: {
    display: 'flex',
    gap: '15px',
  },
  formGroup: {
    marginBottom: '15px',
    flex: 1,
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: '500',
    color: '#555',
    fontSize: '14px',
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

export default TeacherManagement;
