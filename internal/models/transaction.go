package models

import (
	"time"

	"github.com/google/uuid"
)

// Transaction mirrors the public.transactions table.
type Transaction struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	UserID          uuid.UUID `gorm:"type:uuid" json:"user_id"`
	Type            string    `gorm:"type:varchar(10);not null" json:"type"`
	Amount          float64   `gorm:"type:numeric(15,2);not null" json:"amount"`
	Category        string    `gorm:"type:varchar(50);not null" json:"category"`
	Description     string    `json:"description"`
	TransactionDate time.Time `gorm:"type:date;not null" json:"transaction_date"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

// DashboardSummary aggregates totals for the dashboard endpoint.
type DashboardSummary struct {
	TotalBalance float64 `json:"total_balance"`
	TotalIncome  float64 `json:"total_income"`
	TotalExpense float64 `json:"total_expense"`
}

// TransactionFilter carries pagination and filtering options.
type TransactionFilter struct {
	Type   string
	Limit  int
	Offset int
}
