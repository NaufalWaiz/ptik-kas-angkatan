package controllers

import (
	"net/http"

	"kas-angkatan/internal/repository"
	"kas-angkatan/pkg/utils"

	"github.com/gin-gonic/gin"
)

// DashboardController handles dashboard related handlers.
type DashboardController struct {
	transactionRepo repository.TransactionRepository
}

// NewDashboardController creates a new controller instance.
func NewDashboardController(transactionRepo repository.TransactionRepository) *DashboardController {
	return &DashboardController{
		transactionRepo: transactionRepo,
	}
}

// GetDashboard returns income/expense/balance summary.
func (c *DashboardController) GetDashboard(ctx *gin.Context) {
	summary, err := c.transactionRepo.GetDashboardSummary(ctx.Request.Context())
	if err != nil {
		utils.RespondError(ctx, http.StatusInternalServerError, "failed to fetch dashboard summary", err)
		return
	}

	utils.RespondSuccess(ctx, http.StatusOK, summary)
}
