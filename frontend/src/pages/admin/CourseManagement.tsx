import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import type { Course } from '../../types';

const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    course_code: '',
    name: '',
    credit: 0,
    description: '',
    max_students: 0,
  });
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/admin/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  const handleAdd = () => {
    setEditMode(false);
    setEditingCourse(null);
    setFormData({
      course_code: '',
      name: '',
      credit: 0,
      description: '',
      max_students: 0,
    });
    setMessage({ text: '', type: '' });
    setShowModal(true);
  };

  const handleEdit = (course: Course) => {
    setEditMode(true);
    setEditingCourse(course);
    setFormData({
      course_code: course.course_code,
      name: course.name,
      credit: course.credit,
      description: course.description,
      max_students: course.max_students,
    });
    setMessage({ text: '', type: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    try {
      if (editMode && editingCourse) {
        await api.put(`/admin/courses/${editingCourse.id}`, formData);
        setMessage({ text: '课程更新成功', type: 'success' });
      } else {
        await api.post('/admin/courses', formData);
        setMessage({ text: '课程创建成功', type: 'success' });
      }
      setTimeout(() => {
        setShowModal(false);
        fetchCourses();
      }, 500);
    } catch (err: any) {
      setMessage({ text: err.response?.data?.error || '操作失败', type: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除该课程吗？')) {
      return;
    }

    try {
      await api.delete(`/admin/courses/${id}`);
      fetchCourses();
    } catch (err: any) {
      alert(err.response?.data?.error || '删除失败');
    }
  };

  return (
    <div>
      <div style={styles.header}>
        <h2 style={styles.title}>课程管理</h2>
        <button onClick={handleAdd} style={styles.addButton}>
          + 添加课程
        </button>
      </div>

      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHeader}>
            <th style={styles.tableCell}>课程代码</th>
            <th style={styles.tableCell}>课程名称</th>
            <th style={styles.tableCell}>学分</th>
            <th style={styles.tableCell}>最大人数</th>
            <th style={styles.tableCell}>描述</th>
            <th style={styles.tableCell}>操作</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course.id} style={styles.tableRow}>
              <td style={styles.tableCell}>{course.course_code}</td>
              <td style={styles.tableCell}>{course.name}</td>
              <td style={styles.tableCell}>{course.credit}</td>
              <td style={styles.tableCell}>{course.max_students || '-'}</td>
              <td style={styles.tableCell}>{course.description || '-'}</td>
              <td style={styles.tableCell}>
                <button
                  onClick={() => handleEdit(course)}
                  style={styles.editButton}
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(course.id)}
                  style={styles.deleteButton}
                >
                  删除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {courses.length === 0 && (
        <div style={styles.empty}>暂无课程数据</div>
      )}

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>
              {editMode ? '编辑课程' : '添加课程'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>课程代码 *</label>
                <input
                  type="text"
                  value={formData.course_code}
                  onChange={(e) =>
                    setFormData({ ...formData, course_code: e.target.value })
                  }
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>课程名称 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>学分</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.credit}
                  onChange={(e) =>
                    setFormData({ ...formData, credit: parseFloat(e.target.value) || 0 })
                  }
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>最大人数</label>
                <input
                  type="number"
                  value={formData.max_students}
                  onChange={(e) =>
                    setFormData({ ...formData, max_students: parseInt(e.target.value) || 0 })
                  }
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  style={styles.textarea}
                  rows={3}
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
    width: '500px',
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
  formGroup: {
    marginBottom: '15px',
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
  textarea: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box',
    resize: 'vertical',
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

export default CourseManagement;
