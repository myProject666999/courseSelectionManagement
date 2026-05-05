package models

import (
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type Admin struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Username  string         `json:"username" gorm:"unique;not null"`
	Password  string         `json:"-" gorm:"not null"`
	Name      string         `json:"name"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

func (a *Admin) HashPassword(password string) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	a.Password = string(hashedPassword)
	return nil
}

func (a *Admin) CheckPassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(a.Password), []byte(password))
	return err == nil
}

type Teacher struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Username    string         `json:"username" gorm:"unique;not null"`
	Password    string         `json:"-" gorm:"not null"`
	Name        string         `json:"name"`
	Department  string         `json:"department"`
	Title       string         `json:"title"`
	Phone       string         `json:"phone"`
	Email       string         `json:"email"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

func (t *Teacher) HashPassword(password string) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	t.Password = string(hashedPassword)
	return nil
}

func (t *Teacher) CheckPassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(t.Password), []byte(password))
	return err == nil
}

type Student struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	StudentCode string         `json:"student_id" gorm:"column:student_code;unique;not null"`
	Password    string         `json:"-" gorm:"not null"`
	Name        string         `json:"name"`
	Class       string         `json:"class"`
	Department  string         `json:"department"`
	Phone       string         `json:"phone"`
	Email       string         `json:"email"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

func (s *Student) HashPassword(password string) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	s.Password = string(hashedPassword)
	return nil
}

func (s *Student) CheckPassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(s.Password), []byte(password))
	return err == nil
}

type Course struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	CourseCode  string         `json:"course_code" gorm:"unique;not null"`
	Name        string         `json:"name" gorm:"not null"`
	Credit      float64        `json:"credit"`
	Description string         `json:"description"`
	MaxStudents int            `json:"max_students"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

type Schedule struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	CourseID  uint           `json:"course_id" gorm:"not null"`
	TeacherID uint           `json:"teacher_id" gorm:"not null"`
	DayOfWeek int            `json:"day_of_week"`
	StartTime string         `json:"start_time"`
	EndTime   string         `json:"end_time"`
	Classroom string         `json:"classroom"`
	Semester  string         `json:"semester"`
	Year      int            `json:"year"`
	Course    Course         `json:"course" gorm:"foreignKey:CourseID"`
	Teacher   Teacher        `json:"teacher" gorm:"foreignKey:TeacherID"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

type Selection struct {
	ID         uint      `json:"id" gorm:"primaryKey"`
	StudentID  uint      `json:"-" gorm:"not null;index"`
	ScheduleID uint      `json:"schedule_id" gorm:"not null;index"`
	Status     string    `json:"status" gorm:"default:'selected'"`
	Student    Student   `json:"student" gorm:"foreignKey:StudentID"`
	Schedule   Schedule  `json:"schedule" gorm:"foreignKey:ScheduleID"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}
