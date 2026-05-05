import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import type { Schedule } from '../../types';

const CourseSelection: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
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
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await api.get('/student/schedules');
      setSchedules(response.data);
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
    }
  };

  const getDayLabel = (day: number) => {
    const d = days.find((d) => d.value === day);
    return d ? d.label : day;
  };

  const handleSelectCourse = async (scheduleId: number) => {
    if (!window.confirm('确定要选择这门课程吗？')) {
      return;
    }

    setMessage({ text: '', type: '' });

    try {
      await api.post(`/student/select/${scheduleId}`);
      setMessage({ text: '选课成功', type: 'success' });
      fetchSchedules();
    } catch (err: any) {
      setMessage({ text: err.response?.data?.error || '选课失败', type: 'error' });
    }
  };

  return (
    <div>
      <h2 style={styles.title}>可选课程</h2>

      {message.text && (
        <div
          style={{
            ...styles.message,
            backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
            color: message.type === 'success' ? '#155724' : '#721c24',
          }}
        >
          {message.text}
        </div>
      )}

      {schedules.length > 0 ? (
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.tableCell}>课程名称</th>
              <th style={styles.tableCell}>课程代码</th>
              <th style={styles.tableCell}>学分</th>
              <th style={styles.tableCell}>教师</th>
              <th style={styles.tableCell}>星期</th>
              <th style={styles.tableCell}>时间</th>
              <th style={styles.tableCell}>教室</th>
              <th style={styles.tableCell}>操作</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((schedule) => (
              <tr key={schedule.id} style={styles.tableRow}>
                <td style={styles.tableCell}>{schedule.course?.name || '-'}</td>
                <td style={styles.tableCell}>{schedule.course?.course_code || '-'}</td>
                <td style={styles.tableCell}>{schedule.course?.credit || '-'}</td>
                <td style={styles.tableCell}>{schedule.teacher?.name || '-'}</td>
                <td style={styles.tableCell}>{getDayLabel(schedule.day_of_week)}</td>
                <td style={styles.tableCell}>
                  {schedule.start_time} - {schedule.end_time}
                </td>
                <td style={styles.tableCell}>{schedule.classroom || '-'}</td>
                <td style={styles.tableCell}>
                  <button
                    onClick={() => handleSelectCourse(schedule.id)}
                    style={styles.selectButton}
                  >
                    选择
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={styles.empty}>暂无可选课程</div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  title: {
    fontSize: '18px',
    marginBottom: '20px',
    color: '#333',
  },
  message: {
    padding: '10px 15px',
    borderRadius: '4px',
    marginBottom: '20px',
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
  selectButton: {
    padding: '6px 12px',
    backgroundColor: '#17a2b8',
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
    backgroundColor: 'white',
    borderRadius: '8px',
  },
};

export default CourseSelection;
