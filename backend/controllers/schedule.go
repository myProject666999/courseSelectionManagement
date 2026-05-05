package controllers

import (
	"net/http"

	"course-selection-management/config"
	"course-selection-management/models"

	"github.com/gin-gonic/gin"
)

type CreateScheduleRequest struct {
	CourseID  uint   `json:"course_id" binding:"required"`
	TeacherID uint   `json:"teacher_id" binding:"required"`
	DayOfWeek int    `json:"day_of_week"`
	StartTime string `json:"start_time"`
	EndTime   string `json:"end_time"`
	Classroom string `json:"classroom"`
	Semester  string `json:"semester"`
	Year      int    `json:"year"`
}

type UpdateScheduleRequest struct {
	CourseID  uint   `json:"course_id"`
	TeacherID uint   `json:"teacher_id"`
	DayOfWeek int    `json:"day_of_week"`
	StartTime string `json:"start_time"`
	EndTime   string `json:"end_time"`
	Classroom string `json:"classroom"`
	Semester  string `json:"semester"`
	Year      int    `json:"year"`
}

func GetSchedules(c *gin.Context) {
	var schedules []models.Schedule
	if err := config.DB.Preload("Course").Preload("Teacher").Find(&schedules).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, schedules)
}

func GetScheduleByID(c *gin.Context) {
	id := c.Param("id")
	var schedule models.Schedule
	if err := config.DB.Preload("Course").Preload("Teacher").First(&schedule, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Schedule not found"})
		return
	}
	c.JSON(http.StatusOK, schedule)
}

func CreateSchedule(c *gin.Context) {
	var req CreateScheduleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var course models.Course
	if err := config.DB.First(&course, req.CourseID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Course not found"})
		return
	}

	var teacher models.Teacher
	if err := config.DB.First(&teacher, req.TeacherID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Teacher not found"})
		return
	}

	schedule := models.Schedule{
		CourseID:  req.CourseID,
		TeacherID: req.TeacherID,
		DayOfWeek: req.DayOfWeek,
		StartTime: req.StartTime,
		EndTime:   req.EndTime,
		Classroom: req.Classroom,
		Semester:  req.Semester,
		Year:      req.Year,
	}

	if err := config.DB.Create(&schedule).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	config.DB.Preload("Course").Preload("Teacher").First(&schedule, schedule.ID)
	c.JSON(http.StatusCreated, schedule)
}

func UpdateSchedule(c *gin.Context) {
	id := c.Param("id")
	var schedule models.Schedule
	if err := config.DB.First(&schedule, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Schedule not found"})
		return
	}

	var req UpdateScheduleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.CourseID != 0 {
		var course models.Course
		if err := config.DB.First(&course, req.CourseID).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Course not found"})
			return
		}
		schedule.CourseID = req.CourseID
	}
	if req.TeacherID != 0 {
		var teacher models.Teacher
		if err := config.DB.First(&teacher, req.TeacherID).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Teacher not found"})
			return
		}
		schedule.TeacherID = req.TeacherID
	}
	if req.DayOfWeek != 0 {
		schedule.DayOfWeek = req.DayOfWeek
	}
	if req.StartTime != "" {
		schedule.StartTime = req.StartTime
	}
	if req.EndTime != "" {
		schedule.EndTime = req.EndTime
	}
	if req.Classroom != "" {
		schedule.Classroom = req.Classroom
	}
	if req.Semester != "" {
		schedule.Semester = req.Semester
	}
	if req.Year != 0 {
		schedule.Year = req.Year
	}

	if err := config.DB.Save(&schedule).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	config.DB.Preload("Course").Preload("Teacher").First(&schedule, schedule.ID)
	c.JSON(http.StatusOK, schedule)
}

func DeleteSchedule(c *gin.Context) {
	id := c.Param("id")
	var schedule models.Schedule
	if err := config.DB.First(&schedule, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Schedule not found"})
		return
	}

	var selectionCount int64
	config.DB.Model(&models.Selection{}).Where("schedule_id = ?", id).Count(&selectionCount)
	if selectionCount > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot delete schedule: there are students who have selected this course"})
		return
	}

	if err := config.DB.Delete(&schedule).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Schedule deleted successfully"})
}
