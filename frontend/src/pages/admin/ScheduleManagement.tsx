import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import type { Schedule, Course, Teacher } from '../../types';

const ScheduleManagement: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [formData, setFormData] = useState({
    course_id: 0,
    teacher_id: 0,
    day_of_week: 1,
    start_time: '',
    end_time: '',
    classroom: '',
    semester: '',
    year: new Date().getFullYear(),
  });
  const [message, setMessage] = useState({ text: '', type: '' });

  const days = [
    { value: 1, label: '星期一' },
    { value: 2, label: '星期二' },
    { value: 3, label: '星期三' },
    { value: 4, label: '星期四' },
    { value: 5, label: '星期五' },
    { value: 6, label: '星期六' },
    { value: 7, label: '星期日' },
  ];

  useEffect(() => {
    fetchSchedules();
    fetchCourses();
    fetchTeachers();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await api.get('/admin/schedules');
      setSchedules(response.data);
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await api.get('/admin/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

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
    setEditingSchedule(null);
    setFormData({
      course_id: courses.length > 0 ? courses[0].id : 0,
      teacher_id: teachers.length > 0 ? teachers[0].id : 0,
      day_of_week: 1,
      start_time: '',
      end_time: '',
      classroom: '',
      semester: '',
      year: new Date().getFullYear(),
    });
    setMessage({ text: '', type: '' });
    setShowModal(true);
  };

  const handleEdit = (schedule: Schedule) => {
    setEditMode(true);
    setEditingSchedule(schedule);
    setFormData({
      course_id: schedule.course_id,
      teacher_id: schedule.teacher_id,
      day_of_week: schedule.day_of_week,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      classroom: schedule.classroom,
      semester: schedule.semester,
      year: schedule.year,
    });
    setMessage({ text: '', type: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    try {
      if (editMode && editingSchedule) {
        await api.put(`/admin/schedules/${editingSchedule.id}`, formData);
        setMessage({ text: '课表更新成功', type: 'success' });
      } else {
        await api.post('/admin/schedules', formData);
        setMessage({ text: '课表创建成功', type: 'success' });
      }
      setTimeout(() => {
        setShowModal(false);
        fetchSchedules();
      }, 500);
    } catch (err: any) {
      setMessage({ text: err.response?.data?.error || '操作失败', type: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除该课表吗？')) {
      return;
    }

    try {
      await api.delete(`/admin/schedules/${id}`);
      fetchSchedules();
    } catch (err: any) {
      alert(err.response?.data?.error || '删除失败');
    }
  };

  const getDayLabel = (day: number) => {
    const d = days.find((d) => d.value === day);
    return d ? d.label : day;
  };

  return (
    <div>
      <div style={styles.header}>
        <h2 style={styles.title}>课表管理</h2>
        <button onClick={handleAdd} style={styles.addButton}>
          + 添加课表
        </button>
      </div>

      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHeader}>
            <th style={styles.tableCell}>课程</th>
            <th style={styles.tableCell}>教师</th>
            <th style={styles.tableCell}>星期</th>
            <th style={styles.tableCell}>时间</th>
            <th style={styles.tableCell}>教室</th>
            <th style={styles.tableCell}>学期</th>
            <th style={styles.tableCell}>操作</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((schedule) => (
            <tr key={schedule.id} style={styles.tableRow}>
              <td style={styles.tableCell}>{schedule.course?.name || '-'}</td>
              <td style={styles.tableCell}>{schedule.teacher?.name || '-'}</td>
              <td style={styles.tableCell}>{getDayLabel(schedule.day_of_week)}</td>
              <td style={styles.tableCell}>
                {schedule.start_time} - {schedule.end_time}
              </td>
              <td style={styles.tableCell}>{schedule.classroom || '-'}</td>
              <td style={styles.tableCell}>
                {schedule.year} {schedule.semester || ''}
              </td>
              <td style={styles.tableCell}>
                <button
                  onClick={() => handleEdit(schedule)}
                  style={styles.editButton}
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(schedule.id)}
                  style={styles.deleteButton}
                >
                  删除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {schedules.length === 0 && (
        <div style={styles.empty}>暂无课表数据</div>
      )}

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>
              {editMode ? '编辑课表' : '添加课表'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>课程 *</label>
                  <select
                    value={formData.course_id}
                    onChange={(e) =>
                      setFormData({ ...formData, course_id: parseInt(e.target.value) })
                    }
                    style={styles.select}
                    required
                  >
                    <option value="">请选择课程</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>教师 *</label>
                  <select
                    value={formData.teacher_id}
                    onChange={(e) =>
                      setFormData({ ...formData, teacher_id: parseInt(e.target.value) })
                    }
                    style={styles.select}
                    required
                  >
                    <option value="">请选择教师</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>星期</label>
                  <select
                    value={formData.day_of_week}
                    onChange={(e) =>
                      setFormData({ ...formData, day_of_week: parseInt(e.target.value) })
                    }
                    style={styles.select}
                  >
                    {days.map((day) => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>开始时间</label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) =>
                      setFormData({ ...formData, start_time: e.target.value })
                    }
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>结束时间</label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) =>
                      setFormData({ ...formData, end_time: e.target.value })
                    }
                    style={styles.input}
                  />
                </div>
              </div>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>教室</label>
                  <input
                    type="text"
                    value={formData.classroom}
                    onChange={(e) =>
                      setFormData({ ...formData, classroom: e.target.value })
                    }
                    style={styles.input}
                    placeholder="例如: A101"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>学期</label>
                  <select
                    value={formData.semester}
                    onChange={(e) =>
                      setFormData({ ...formData, semester: e.target.value })
                    }
                    style={styles.select}
                  >
                    <option value="">请选择学期</option>
                    <option value="第一学期">第一学期</option>
                    <option value="第二学期">第二学期</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>年份</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({ ...formData, year: parseInt(e.target.value) })
                    }
                    style={styles.input}
                  />
                </div>
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
    width: '700px',
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
  select: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box',
    backgroundColor: 'white',
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

export default ScheduleManagement;
