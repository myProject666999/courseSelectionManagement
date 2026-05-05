import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import type { Student } from '../../types';

const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    student_id: '',
    password: '',
    name: '',
    class: '',
    department: '',
    phone: '',
    email: '',
  });
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/admin/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  const handleAdd = () => {
    setEditMode(false);
    setEditingStudent(null);
    setFormData({
      student_id: '',
      password: '',
      name: '',
      class: '',
      department: '',
      phone: '',
      email: '',
    });
    setMessage({ text: '', type: '' });
    setShowModal(true);
  };

  const handleEdit = (student: Student) => {
    setEditMode(true);
    setEditingStudent(student);
    setFormData({
      student_id: student.student_id,
      password: '',
      name: student.name,
      class: student.class,
      department: student.department,
      phone: student.phone,
      email: student.email,
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

      if (editMode && editingStudent) {
        await api.put(`/admin/students/${editingStudent.id}`, submitData);
        setMessage({ text: '学生更新成功', type: 'success' });
      } else {
        await api.post('/admin/students', submitData);
        setMessage({ text: '学生创建成功', type: 'success' });
      }
      setTimeout(() => {
        setShowModal(false);
        fetchStudents();
      }, 500);
    } catch (err: any) {
      setMessage({ text: err.response?.data?.error || '操作失败', type: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除该学生吗？')) {
      return;
    }

    try {
      await api.delete(`/admin/students/${id}`);
      fetchStudents();
    } catch (err: any) {
      alert(err.response?.data?.error || '删除失败');
    }
  };

  return (
    <div>
      <div style={styles.header}>
        <h2 style={styles.title}>学生管理</h2>
        <button onClick={handleAdd} style={styles.addButton}>
          + 添加学生
        </button>
      </div>

      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHeader}>
            <th style={styles.tableCell}>学号</th>
            <th style={styles.tableCell}>姓名</th>
            <th style={styles.tableCell}>班级</th>
            <th style={styles.tableCell}>院系</th>
            <th style={styles.tableCell}>电话</th>
            <th style={styles.tableCell}>邮箱</th>
            <th style={styles.tableCell}>操作</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id} style={styles.tableRow}>
              <td style={styles.tableCell}>{student.student_id}</td>
              <td style={styles.tableCell}>{student.name || '-'}</td>
              <td style={styles.tableCell}>{student.class || '-'}</td>
              <td style={styles.tableCell}>{student.department || '-'}</td>
              <td style={styles.tableCell}>{student.phone || '-'}</td>
              <td style={styles.tableCell}>{student.email || '-'}</td>
              <td style={styles.tableCell}>
                <button
                  onClick={() => handleEdit(student)}
                  style={styles.editButton}
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(student.id)}
                  style={styles.deleteButton}
                >
                  删除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {students.length === 0 && (
        <div style={styles.empty}>暂无学生数据</div>
      )}

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>
              {editMode ? '编辑学生' : '添加学生'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>学号 *</label>
                  <input
                    type="text"
                    value={formData.student_id}
                    onChange={(e) =>
                      setFormData({ ...formData, student_id: e.target.value })
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
                  <label style={styles.label}>班级</label>
                  <input
                    type="text"
                    value={formData.class}
                    onChange={(e) =>
                      setFormData({ ...formData, class: e.target.value })
                    }
                    style={styles.input}
                  />
                </div>
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
              <div style={styles.formRow}>
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

export default StudentManagement;
