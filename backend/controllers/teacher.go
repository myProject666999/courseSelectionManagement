package controllers

import (
	"net/http"

	"course-selection-management/config"
	"course-selection-management/models"

	"github.com/gin-gonic/gin"
)

type CreateTeacherRequest struct {
	Username   string `json:"username" binding:"required"`
	Password   string `json:"password" binding:"required"`
	Name       string `json:"name"`
	Department string `json:"department"`
	Title      string `json:"title"`
	Phone      string `json:"phone"`
	Email      string `json:"email"`
}

type UpdateTeacherRequest struct {
	Username   string `json:"username"`
	Name       string `json:"name"`
	Department string `json:"department"`
	Title      string `json:"title"`
	Phone      string `json:"phone"`
	Email      string `json:"email"`
}

func GetTeachers(c *gin.Context) {
	var teachers []models.Teacher
	if err := config.DB.Find(&teachers).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, teachers)
}

func GetTeacherByID(c *gin.Context) {
	id := c.Param("id")
	var teacher models.Teacher
	if err := config.DB.First(&teacher, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Teacher not found"})
		return
	}
	c.JSON(http.StatusOK, teacher)
}

func CreateTeacher(c *gin.Context) {
	var req CreateTeacherRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var existingTeacher models.Teacher
	if err := config.DB.Where("username = ?", req.Username).First(&existingTeacher).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username already exists"})
		return
	}

	teacher := models.Teacher{
		Username:   req.Username,
		Name:       req.Name,
		Department: req.Department,
		Title:      req.Title,
		Phone:      req.Phone,
		Email:      req.Email,
	}
	teacher.HashPassword(req.Password)

	if err := config.DB.Create(&teacher).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, teacher)
}

func UpdateTeacher(c *gin.Context) {
	id := c.Param("id")
	var teacher models.Teacher
	if err := config.DB.First(&teacher, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Teacher not found"})
		return
	}

	var req UpdateTeacherRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Username != "" {
		var existingTeacher models.Teacher
		if err := config.DB.Where("username = ? AND id != ?", req.Username, id).First(&existingTeacher).Error; err == nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Username already exists"})
			return
		}
		teacher.Username = req.Username
	}
	if req.Name != "" {
		teacher.Name = req.Name
	}
	if req.Department != "" {
		teacher.Department = req.Department
	}
	if req.Title != "" {
		teacher.Title = req.Title
	}
	if req.Phone != "" {
		teacher.Phone = req.Phone
	}
	if req.Email != "" {
		teacher.Email = req.Email
	}

	if err := config.DB.Save(&teacher).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, teacher)
}

func DeleteTeacher(c *gin.Context) {
	id := c.Param("id")
	var teacher models.Teacher
	if err := config.DB.First(&teacher, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Teacher not found"})
		return
	}

	var scheduleCount int64
	config.DB.Model(&models.Schedule{}).Where("teacher_id = ?", id).Count(&scheduleCount)
	if scheduleCount > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot delete teacher: there are schedules associated with this teacher"})
		return
	}

	if err := config.DB.Delete(&teacher).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Teacher deleted successfully"})
}

func GetTeacherInfo(c *gin.Context) {
	userID := c.GetUint("user_id")
	var teacher models.Teacher
	if err := config.DB.First(&teacher, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Teacher not found"})
		return
	}
	c.JSON(http.StatusOK, teacher)
}

func ChangeTeacherPassword(c *gin.Context) {
	userID := c.GetUint("user_id")
	var req UpdatePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var teacher models.Teacher
	if err := config.DB.First(&teacher, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Teacher not found"})
		return
	}

	if !teacher.CheckPassword(req.OldPassword) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Old password is incorrect"})
		return
	}

	teacher.HashPassword(req.NewPassword)
	if err := config.DB.Save(&teacher).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password updated successfully"})
}

func GetTeacherSchedules(c *gin.Context) {
	userID := c.GetUint("user_id")
	var schedules []models.Schedule
	if err := config.DB.Preload("Course").Preload("Teacher").
		Where("teacher_id = ?", userID).Find(&schedules).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, schedules)
}
