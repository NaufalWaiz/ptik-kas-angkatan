package controllers

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"kas-angkatan/internal/models"
	"kas-angkatan/internal/repository"
	"kas-angkatan/pkg/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// TransactionsController handles CRUD endpoints for transactions.
type TransactionsController struct {
	transactionRepo repository.TransactionRepository
}

// NewTransactionsController creates the controller.
func NewTransactionsController(transactionRepo repository.TransactionRepository) *TransactionsController {
	return &TransactionsController{
		transactionRepo: transactionRepo,
	}
}

// ListTransactions returns paginated transaction list.
func (c *TransactionsController) ListTransactions(ctx *gin.Context) {
	page := parseQueryInt(ctx, "page", 1)
	limit := parseQueryInt(ctx, "limit", 10)
	if limit <= 0 {
		limit = 10
	}
	if page <= 0 {
		page = 1
	}
	offset := (page - 1) * limit

	filter := models.TransactionFilter{
		Type:   strings.TrimSpace(ctx.Query("type")),
		Limit:  limit,
		Offset: offset,
	}

	transactions, total, err := c.transactionRepo.ListTransactions(ctx.Request.Context(), filter)
	if err != nil {
		utils.RespondError(ctx, http.StatusInternalServerError, "failed to fetch transactions", err)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   transactions,
		"meta": gin.H{
			"page":       page,
			"limit":      limit,
			"total":      total,
			"total_page": calcTotalPages(total, int64(limit)),
		},
	})
}

type createTransactionRequest struct {
	Type        string  `json:"type" binding:"required,oneof=income expense"`
	Amount      float64 `json:"amount" binding:"required,gt=0"`
	Category    string  `json:"category" binding:"required"`
	Description string  `json:"description"`
	Date        string  `json:"date" binding:"required"`
}

// CreateTransaction handles POST /transactions.
func (c *TransactionsController) CreateTransaction(ctx *gin.Context) {
	var payload createTransactionRequest
	if err := ctx.ShouldBindJSON(&payload); err != nil {
		utils.RespondError(ctx, http.StatusBadRequest, "invalid request payload", err)
		return
	}

	transactionDate, err := time.Parse("2006-01-02", payload.Date)
	if err != nil {
		utils.RespondError(ctx, http.StatusBadRequest, "invalid date format, use YYYY-MM-DD", err)
		return
	}

	userIDValue, exists := ctx.Get("currentUserID")
	if !exists {
		utils.RespondError(ctx, http.StatusUnauthorized, "missing user context", nil)
		return
	}
	userID, err := uuid.Parse(userIDValue.(string))
	if err != nil {
		utils.RespondError(ctx, http.StatusUnauthorized, "invalid user context", err)
		return
	}

	tx := &models.Transaction{
		UserID:          userID,
		Type:            payload.Type,
		Amount:          payload.Amount,
		Category:        payload.Category,
		Description:     payload.Description,
		TransactionDate: transactionDate,
	}

	if err := c.transactionRepo.CreateTransaction(ctx.Request.Context(), tx); err != nil {
		utils.RespondError(ctx, http.StatusInternalServerError, "failed to create transaction", err)
		return
	}

	utils.RespondSuccess(ctx, http.StatusCreated, gin.H{"message": "Transaction created"})
}

type updateTransactionRequest struct {
	Type        *string  `json:"type" binding:"omitempty,oneof=income expense"`
	Amount      *float64 `json:"amount" binding:"omitempty,gt=0"`
	Category    *string  `json:"category" binding:"omitempty"`
	Description *string  `json:"description" binding:"omitempty"`
	Date        *string  `json:"date" binding:"omitempty"`
}

// UpdateTransaction handles PUT /transactions/:id.
func (c *TransactionsController) UpdateTransaction(ctx *gin.Context) {
	id, err := parseIDParam(ctx.Param("id"))
	if err != nil {
		utils.RespondError(ctx, http.StatusBadRequest, "invalid transaction id", err)
		return
	}

	var payload updateTransactionRequest
	if err := ctx.ShouldBindJSON(&payload); err != nil {
		utils.RespondError(ctx, http.StatusBadRequest, "invalid request payload", err)
		return
	}

	transaction, err := c.transactionRepo.GetTransactionByID(ctx.Request.Context(), id)
	if err != nil {
		if err == repository.ErrTransactionNotFound {
			utils.RespondError(ctx, http.StatusNotFound, "transaction not found", err)
			return
		}
		utils.RespondError(ctx, http.StatusInternalServerError, "failed to load transaction", err)
		return
	}

	if payload.Type != nil {
		transaction.Type = *payload.Type
	}
	if payload.Amount != nil {
		transaction.Amount = *payload.Amount
	}
	if payload.Category != nil {
		transaction.Category = *payload.Category
	}
	if payload.Description != nil {
		transaction.Description = *payload.Description
	}
	if payload.Date != nil {
		transactionDate, parseErr := time.Parse("2006-01-02", *payload.Date)
		if parseErr != nil {
			utils.RespondError(ctx, http.StatusBadRequest, "invalid date format, use YYYY-MM-DD", parseErr)
			return
		}
		transaction.TransactionDate = transactionDate
	}

	if err := c.transactionRepo.UpdateTransaction(ctx.Request.Context(), transaction); err != nil {
		utils.RespondError(ctx, http.StatusInternalServerError, "failed to update transaction", err)
		return
	}

	utils.RespondSuccess(ctx, http.StatusOK, gin.H{"message": "Transaction updated"})
}

// DeleteTransaction handles DELETE /transactions/:id.
func (c *TransactionsController) DeleteTransaction(ctx *gin.Context) {
	id, err := parseIDParam(ctx.Param("id"))
	if err != nil {
		utils.RespondError(ctx, http.StatusBadRequest, "invalid transaction id", err)
		return
	}

	if err := c.transactionRepo.DeleteTransaction(ctx.Request.Context(), id); err != nil {
		if err == repository.ErrTransactionNotFound {
			utils.RespondError(ctx, http.StatusNotFound, "transaction not found", err)
			return
		}
		utils.RespondError(ctx, http.StatusInternalServerError, "failed to delete transaction", err)
		return
	}

	utils.RespondSuccess(ctx, http.StatusOK, gin.H{"message": "Transaction deleted"})
}

func parseQueryInt(ctx *gin.Context, key string, defaultValue int) int {
	value := ctx.DefaultQuery(key, strconv.Itoa(defaultValue))
	parsed, err := strconv.Atoi(value)
	if err != nil {
		return defaultValue
	}
	return parsed
}

func calcTotalPages(totalRecords int64, limit int64) int64 {
	if limit <= 0 {
		return 1
	}
	pages := totalRecords / limit
	if totalRecords%limit != 0 {
		pages++
	}
	if pages == 0 {
		return 1
	}
	return pages
}

func parseIDParam(idParam string) (uint, error) {
	idUint64, err := strconv.ParseUint(idParam, 10, 64)
	if err != nil {
		return 0, err
	}
	return uint(idUint64), nil
}
