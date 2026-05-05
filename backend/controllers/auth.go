package controllers

import (
	"net/http"

	"course-selection-management/config"
	"course-selection-management/models"
	"course-selection-management/utils"

	"github.com/gin-gonic/gin"
)

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
	Role     string `json:"role" binding:"required"`
}

func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var token string
	var user interface{}

	switch req.Role {
	case "admin":
		var admin models.Admin
		if err := config.DB.Where("username = ?", req.Username).First(&admin).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
			return
		}
		if !admin.CheckPassword(req.Password) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
			return
		}
		var err error
		token, err = utils.GenerateToken(admin.ID, admin.Username, "admin")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
			return
		}
		user = admin

	case "teacher":
		var teacher models.Teacher
		if err := config.DB.Where("username = ?", req.Username).First(&teacher).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
			return
		}
		if !teacher.CheckPassword(req.Password) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
			return
		}
		var err error
		token, err = utils.GenerateToken(teacher.ID, teacher.Username, "teacher")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
			return
		}
		user = teacher

	case "student":
		var student models.Student
		if err := config.DB.Where("student_code = ?", req.Username).First(&student).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid student ID or password"})
			return
		}
		if !student.CheckPassword(req.Password) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid student ID or password"})
			return
		}
		var err error
		token, err = utils.GenerateToken(student.ID, student.StudentCode, "student")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
			return
		}
		user = student

	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user":  user,
		"role":  req.Role,
	})
}
