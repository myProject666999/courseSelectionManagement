package main

import (
	"course-selection-management/config"
	"course-selection-management/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	config.LoadConfig()

	config.ConnectDatabase()
	config.MigrateDatabase()
	config.SeedDatabase()

	r := gin.Default()

	routes.SetupRoutes(r)

	serverPort := ":" + config.AppConfig.ServerPort
	r.Run(serverPort)
}
