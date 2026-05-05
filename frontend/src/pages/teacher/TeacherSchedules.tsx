import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import type { Schedule } from '../../types';

const TeacherSchedules: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);

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
      const response = await api.get('/teacher/schedules');
      setSchedules(response.data);
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
    }
  };

  const getDayLabel = (day: number) => {
    const d = days.find((d) => d.value === day);
    return d ? d.label : day;
  };

  return (
    <div>
      <h2 style={styles.title}>我的课表</h2>

      {schedules.length > 0 ? (
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.tableCell}>课程</th>
              <th style={styles.tableCell}>课程代码</th>
              <th style={styles.tableCell}>学分</th>
              <th style={styles.tableCell}>星期</th>
              <th style={styles.tableCell}>时间</th>
              <th style={styles.tableCell}>教室</th>
              <th style={styles.tableCell}>学期</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((schedule) => (
              <tr key={schedule.id} style={styles.tableRow}>
                <td style={styles.tableCell}>{schedule.course?.name || '-'}</td>
                <td style={styles.tableCell}>{schedule.course?.course_code || '-'}</td>
                <td style={styles.tableCell}>{schedule.course?.credit || '-'}</td>
                <td style={styles.tableCell}>{getDayLabel(schedule.day_of_week)}</td>
                <td style={styles.tableCell}>
                  {schedule.start_time} - {schedule.end_time}
                </td>
                <td style={styles.tableCell}>{schedule.classroom || '-'}</td>
                <td style={styles.tableCell}>
                  {schedule.year} {schedule.semester || ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={styles.empty}>暂无课表信息</div>
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
  empty: {
    textAlign: 'center',
    padding: '40px',
    color: '#999',
    backgroundColor: 'white',
    borderRadius: '8px',
  },
};

export default TeacherSchedules;
