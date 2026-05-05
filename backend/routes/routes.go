package routes

import (
	"course-selection-management/controllers"
	"course-selection-management/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	api := r.Group("/api")
	{
		api.POST("/login", controllers.Login)

		admin := api.Group("/admin")
		admin.Use(middleware.AuthMiddleware("admin"))
		{
			admin.GET("/info", controllers.GetAdminInfo)
			admin.POST("/change-password", controllers.ChangeAdminPassword)

			admin.GET("/admins", controllers.GetAdmins)
			admin.GET("/admins/:id", controllers.GetAdminByID)
			admin.POST("/admins", controllers.CreateAdmin)
			admin.PUT("/admins/:id", controllers.UpdateAdmin)
			admin.DELETE("/admins/:id", controllers.DeleteAdmin)
			admin.POST("/admins/:id/reset-password", controllers.ResetAdminPassword)

			admin.GET("/courses", controllers.GetCourses)
			admin.GET("/courses/:id", controllers.GetCourseByID)
			admin.POST("/courses", controllers.CreateCourse)
			admin.PUT("/courses/:id", controllers.UpdateCourse)
			admin.DELETE("/courses/:id", controllers.DeleteCourse)

			admin.GET("/teachers", controllers.GetTeachers)
			admin.GET("/teachers/:id", controllers.GetTeacherByID)
			admin.POST("/teachers", controllers.CreateTeacher)
			admin.PUT("/teachers/:id", controllers.UpdateTeacher)
			admin.DELETE("/teachers/:id", controllers.DeleteTeacher)

			admin.GET("/schedules", controllers.GetSchedules)
			admin.GET("/schedules/:id", controllers.GetScheduleByID)
			admin.POST("/schedules", controllers.CreateSchedule)
			admin.PUT("/schedules/:id", controllers.UpdateSchedule)
			admin.DELETE("/schedules/:id", controllers.DeleteSchedule)

			admin.GET("/students", controllers.GetStudents)
			admin.GET("/students/:id", controllers.GetStudentByID)
			admin.POST("/students", controllers.CreateStudent)
			admin.PUT("/students/:id", controllers.UpdateStudent)
			admin.DELETE("/students/:id", controllers.DeleteStudent)
		}

		teacher := api.Group("/teacher")
		teacher.Use(middleware.AuthMiddleware("teacher"))
		{
			teacher.GET("/info", controllers.GetTeacherInfo)
			teacher.POST("/change-password", controllers.ChangeTeacherPassword)
			teacher.GET("/schedules", controllers.GetTeacherSchedules)
		}

		student := api.Group("/student")
		student.Use(middleware.AuthMiddleware("student"))
		{
			student.GET("/info", controllers.GetStudentInfo)
			student.POST("/change-password", controllers.ChangeStudentPassword)
			student.GET("/schedules", controllers.GetAvailableSchedules)
			student.GET("/selections", controllers.GetMySelections)
			student.POST("/select/:schedule_id", controllers.SelectCourse)
			student.DELETE("/drop/:schedule_id", controllers.DropCourse)
		}
	}
}
