package repository

import (
	"context"
	"errors"

	"kas-angkatan/internal/models"

	"gorm.io/gorm"
)

// ErrTransactionNotFound indicates the requested transaction does not exist.
var ErrTransactionNotFound = errors.New("transaction not found")

// TransactionRepository defines behaviour for interacting with transactions.
type TransactionRepository interface {
	GetDashboardSummary(ctx context.Context) (*models.DashboardSummary, error)
	ListTransactions(ctx context.Context, filter models.TransactionFilter) ([]models.Transaction, int64, error)
	CreateTransaction(ctx context.Context, tx *models.Transaction) error
	UpdateTransaction(ctx context.Context, tx *models.Transaction) error
	DeleteTransaction(ctx context.Context, id uint) error
	GetTransactionByID(ctx context.Context, id uint) (*models.Transaction, error)
}

type transactionRepository struct {
	db *gorm.DB
}

// NewTransactionRepository instantiates the repository.
func NewTransactionRepository(db *gorm.DB) TransactionRepository {
	return &transactionRepository{db: db}
}

func (r *transactionRepository) GetDashboardSummary(ctx context.Context) (*models.DashboardSummary, error) {
	var income, expense struct {
		Total float64
	}

	if err := r.db.WithContext(ctx).
		Model(&models.Transaction{}).
		Where("type = ?", "income").
		Select("COALESCE(SUM(amount), 0) as total").
		Scan(&income).Error; err != nil {
		return nil, err
	}

	if err := r.db.WithContext(ctx).
		Model(&models.Transaction{}).
		Where("type = ?", "expense").
		Select("COALESCE(SUM(amount), 0) as total").
		Scan(&expense).Error; err != nil {
		return nil, err
	}

	summary := &models.DashboardSummary{
		TotalIncome:  income.Total,
		TotalExpense: expense.Total,
		TotalBalance: income.Total - expense.Total,
	}

	return summary, nil
}

func (r *transactionRepository) ListTransactions(ctx context.Context, filter models.TransactionFilter) ([]models.Transaction, int64, error) {
	var (
		transactions []models.Transaction
		total        int64
	)

	query := r.db.WithContext(ctx).Model(&models.Transaction{})

	if filter.Type != "" {
		query = query.Where("type = ?", filter.Type)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if filter.Limit > 0 {
		query = query.Limit(filter.Limit)
	}
	if filter.Offset >= 0 {
		query = query.Offset(filter.Offset)
	}

	if err := query.Order("transaction_date DESC").
		Order("created_at DESC").
		Find(&transactions).Error; err != nil {
		return nil, 0, err
	}

	return transactions, total, nil
}

func (r *transactionRepository) CreateTransaction(ctx context.Context, tx *models.Transaction) error {
	return r.db.WithContext(ctx).Create(tx).Error
}

func (r *transactionRepository) UpdateTransaction(ctx context.Context, tx *models.Transaction) error {
	return r.db.WithContext(ctx).Save(tx).Error
}

func (r *transactionRepository) DeleteTransaction(ctx context.Context, id uint) error {
	result := r.db.WithContext(ctx).Delete(&models.Transaction{}, id)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return ErrTransactionNotFound
	}
	return nil
}

func (r *transactionRepository) GetTransactionByID(ctx context.Context, id uint) (*models.Transaction, error) {
	var tx models.Transaction
	err := r.db.WithContext(ctx).First(&tx, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrTransactionNotFound
		}
		return nil, err
	}
	return &tx, nil
}
