package routes

import (
	"time"

	"kas-angkatan/internal/config"
	"kas-angkatan/internal/controllers"
	"kas-angkatan/internal/middleware"
	"kas-angkatan/internal/repository"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// SetupRouter wires repositories, controllers, and routes.
func SetupRouter(db *gorm.DB, cfg *config.Config) *gin.Engine {
	if cfg.AppEnv == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()
	router.Use(gin.Logger(), gin.Recovery())
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	transactionRepo := repository.NewTransactionRepository(db)
	profileRepo := repository.NewProfileRepository(db)

	dashboardController := controllers.NewDashboardController(transactionRepo)
	transactionController := controllers.NewTransactionsController(transactionRepo)
	authController := controllers.NewAuthController(cfg)
	auth := middleware.NewAuthMiddleware(profileRepo, cfg.SupabaseJWTSecret)

	api := router.Group("/api/v1")
	{
		api.POST("/auth/register", authController.Register)
		api.POST("/auth/login", authController.Login)
		api.GET("/dashboard", dashboardController.GetDashboard)
		api.GET("/transactions", transactionController.ListTransactions)

		protected := api.Group("/")
		protected.Use(auth.RequireRoles("admin", "bendahara"))
		{
			protected.POST("/transactions", transactionController.CreateTransaction)
			protected.PUT("/transactions/:id", transactionController.UpdateTransaction)
			protected.DELETE("/transactions/:id", transactionController.DeleteTransaction)
		}
	}

	return router
}
