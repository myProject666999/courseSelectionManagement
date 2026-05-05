package controllers

import (
	"net/http"

	"course-selection-management/config"
	"course-selection-management/models"

	"github.com/gin-gonic/gin"
)

type CreateStudentRequest struct {
	StudentID  string `json:"student_id" binding:"required"`
	Password   string `json:"password" binding:"required"`
	Name       string `json:"name"`
	Class      string `json:"class"`
	Department string `json:"department"`
	Phone      string `json:"phone"`
	Email      string `json:"email"`
}

type UpdateStudentRequest struct {
	Name       string `json:"name"`
	Class      string `json:"class"`
	Department string `json:"department"`
	Phone      string `json:"phone"`
	Email      string `json:"email"`
}

func GetStudents(c *gin.Context) {
	var students []models.Student
	if err := config.DB.Find(&students).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, students)
}

func GetStudentByID(c *gin.Context) {
	id := c.Param("id")
	var student models.Student
	if err := config.DB.First(&student, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Student not found"})
		return
	}
	c.JSON(http.StatusOK, student)
}

func CreateStudent(c *gin.Context) {
	var req CreateStudentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var existingStudent models.Student
	if err := config.DB.Where("student_code = ?", req.StudentID).First(&existingStudent).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Student ID already exists"})
		return
	}

	student := models.Student{
		StudentCode: req.StudentID,
		Name:        req.Name,
		Class:       req.Class,
		Department:  req.Department,
		Phone:       req.Phone,
		Email:       req.Email,
	}
	student.HashPassword(req.Password)

	if err := config.DB.Create(&student).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, student)
}

func UpdateStudent(c *gin.Context) {
	id := c.Param("id")
	var student models.Student
	if err := config.DB.First(&student, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Student not found"})
		return
	}

	var req UpdateStudentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Name != "" {
		student.Name = req.Name
	}
	if req.Class != "" {
		student.Class = req.Class
	}
	if req.Department != "" {
		student.Department = req.Department
	}
	if req.Phone != "" {
		student.Phone = req.Phone
	}
	if req.Email != "" {
		student.Email = req.Email
	}

	if err := config.DB.Save(&student).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, student)
}

func DeleteStudent(c *gin.Context) {
	id := c.Param("id")
	var student models.Student
	if err := config.DB.First(&student, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Student not found"})
		return
	}

	var selectionCount int64
	config.DB.Model(&models.Selection{}).Where("student_id = ?", id).Count(&selectionCount)
	if selectionCount > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot delete student: there are course selections associated with this student"})
		return
	}

	if err := config.DB.Delete(&student).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Student deleted successfully"})
}

func GetStudentInfo(c *gin.Context) {
	userID := c.GetUint("user_id")
	var student models.Student
	if err := config.DB.First(&student, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Student not found"})
		return
	}
	c.JSON(http.StatusOK, student)
}

func ChangeStudentPassword(c *gin.Context) {
	userID := c.GetUint("user_id")
	var req UpdatePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var student models.Student
	if err := config.DB.First(&student, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Student not found"})
		return
	}

	if !student.CheckPassword(req.OldPassword) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Old password is incorrect"})
		return
	}

	student.HashPassword(req.NewPassword)
	if err := config.DB.Save(&student).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password updated successfully"})
}

func GetAvailableSchedules(c *gin.Context) {
	userID := c.GetUint("user_id")

	var selectedScheduleIDs []uint
	config.DB.Model(&models.Selection{}).
		Where("student_id = ?", userID).
		Pluck("schedule_id", &selectedScheduleIDs)

	var schedules []models.Schedule
	query := config.DB.Preload("Course").Preload("Teacher")

	if len(selectedScheduleIDs) > 0 {
		query = query.Where("id NOT IN ?", selectedScheduleIDs)
	}

	if err := query.Find(&schedules).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, schedules)
}

func GetMySelections(c *gin.Context) {
	userID := c.GetUint("user_id")

	var selections []models.Selection
	if err := config.DB.Preload("Schedule").
		Preload("Schedule.Course").
		Preload("Schedule.Teacher").
		Where("student_id = ?", userID).Find(&selections).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, selections)
}

func SelectCourse(c *gin.Context) {
	userID := c.GetUint("user_id")
	scheduleID := c.Param("schedule_id")

	var schedule models.Schedule
	if err := config.DB.Preload("Course").First(&schedule, scheduleID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Schedule not found"})
		return
	}

	var existingSelection models.Selection
	if err := config.DB.Where("student_id = ? AND schedule_id = ?", userID, scheduleID).First(&existingSelection).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "You have already selected this course"})
		return
	}

	var currentCount int64
	config.DB.Model(&models.Selection{}).Where("schedule_id = ?", scheduleID).Count(&currentCount)

	if schedule.Course.MaxStudents > 0 && int(currentCount) >= schedule.Course.MaxStudents {
		c.JSON(http.StatusBadRequest, gin.H{"error": "This course is full"})
		return
	}

	selection := models.Selection{
		StudentID:  userID,
		ScheduleID: schedule.ID,
		Status:     "selected",
	}

	if err := config.DB.Create(&selection).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	config.DB.Preload("Schedule").
		Preload("Schedule.Course").
		Preload("Schedule.Teacher").
		First(&selection, selection.ID)

	c.JSON(http.StatusCreated, selection)
}

func DropCourse(c *gin.Context) {
	userID := c.GetUint("user_id")
	scheduleID := c.Param("schedule_id")

	var selection models.Selection
	if err := config.DB.Where("student_id = ? AND schedule_id = ?", userID, scheduleID).First(&selection).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "You have not selected this course"})
		return
	}

	if err := config.DB.Delete(&selection).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Course dropped successfully"})
}
