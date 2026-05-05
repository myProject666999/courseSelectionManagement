export interface Admin {
  id: number;
  username: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Teacher {
  id: number;
  username: string;
  name: string;
  department: string;
  title: string;
  phone: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: number;
  student_id: string;
  name: string;
  class: string;
  department: string;
  phone: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: number;
  course_code: string;
  name: string;
  credit: number;
  description: string;
  max_students: number;
  created_at: string;
  updated_at: string;
}

export interface Schedule {
  id: number;
  course_id: number;
  teacher_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  classroom: string;
  semester: string;
  year: number;
  course: Course;
  teacher: Teacher;
  created_at: string;
  updated_at: string;
}

export interface Selection {
  id: number;
  student_id: number;
  schedule_id: number;
  status: string;
  schedule: Schedule;
  created_at: string;
  updated_at: string;
}

export type User = Admin | Teacher | Student;
export type Role = 'admin' | 'teacher' | 'student';

export interface LoginResponse {
  token: string;
  user: User;
  role: Role;
}
