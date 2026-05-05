package config

import (
	"fmt"
	"log"

	"course-selection-management/models"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDatabase() {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		AppConfig.DBUser,
		AppConfig.DBPassword,
		AppConfig.DBHost,
		AppConfig.DBPort,
		AppConfig.DBName,
	)

	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	log.Println("Database connected successfully")
}

func MigrateDatabase() {
	err := DB.AutoMigrate(
		&models.Admin{},
		&models.Teacher{},
		&models.Student{},
		&models.Course{},
		&models.Schedule{},
		&models.Selection{},
	)
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	log.Println("Database migrated successfully")
}

func SeedDatabase() {
	var adminCount int64
	DB.Model(&models.Admin{}).Count(&adminCount)
	if adminCount == 0 {
		admin := &models.Admin{
			Username: "admin",
			Name:     "系统管理员",
		}
		admin.HashPassword("admin123")
		DB.Create(admin)
		log.Println("Default admin created: username=admin, password=admin123")
	}
}
