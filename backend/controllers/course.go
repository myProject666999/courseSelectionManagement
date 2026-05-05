package controllers

import (
	"net/http"

	"course-selection-management/config"
	"course-selection-management/models"

	"github.com/gin-gonic/gin"
)

type CreateCourseRequest struct {
	CourseCode  string  `json:"course_code" binding:"required"`
	Name        string  `json:"name" binding:"required"`
	Credit      float64 `json:"credit"`
	Description string  `json:"description"`
	MaxStudents int     `json:"max_students"`
}

type UpdateCourseRequest struct {
	CourseCode  string  `json:"course_code"`
	Name        string  `json:"name"`
	Credit      float64 `json:"credit"`
	Description string  `json:"description"`
	MaxStudents int     `json:"max_students"`
}

func GetCourses(c *gin.Context) {
	var courses []models.Course
	if err := config.DB.Find(&courses).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, courses)
}

func GetCourseByID(c *gin.Context) {
	id := c.Param("id")
	var course models.Course
	if err := config.DB.First(&course, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Course not found"})
		return
	}
	c.JSON(http.StatusOK, course)
}

func CreateCourse(c *gin.Context) {
	var req CreateCourseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var existingCourse models.Course
	if err := config.DB.Where("course_code = ?", req.CourseCode).First(&existingCourse).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Course code already exists"})
		return
	}

	course := models.Course{
		CourseCode:  req.CourseCode,
		Name:        req.Name,
		Credit:      req.Credit,
		Description: req.Description,
		MaxStudents: req.MaxStudents,
	}

	if err := config.DB.Create(&course).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, course)
}

func UpdateCourse(c *gin.Context) {
	id := c.Param("id")
	var course models.Course
	if err := config.DB.First(&course, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Course not found"})
		return
	}

	var req UpdateCourseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.CourseCode != "" {
		var existingCourse models.Course
		if err := config.DB.Where("course_code = ? AND id != ?", req.CourseCode, id).First(&existingCourse).Error; err == nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Course code already exists"})
			return
		}
		course.CourseCode = req.CourseCode
	}
	if req.Name != "" {
		course.Name = req.Name
	}
	if req.Credit != 0 {
		course.Credit = req.Credit
	}
	if req.Description != "" {
		course.Description = req.Description
	}
	if req.MaxStudents != 0 {
		course.MaxStudents = req.MaxStudents
	}

	if err := config.DB.Save(&course).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, course)
}

func DeleteCourse(c *gin.Context) {
	id := c.Param("id")
	var course models.Course
	if err := config.DB.First(&course, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Course not found"})
		return
	}

	var scheduleCount int64
	config.DB.Model(&models.Schedule{}).Where("course_id = ?", id).Count(&scheduleCount)
	if scheduleCount > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot delete course: there are schedules associated with this course"})
		return
	}

	if err := config.DB.Delete(&course).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Course deleted successfully"})
}
