package repository

import (
	"context"
	"errors"

	"kas-angkatan/internal/models"

	"gorm.io/gorm"
)

// ErrProfileNotFound is returned when a profile cannot be found by ID.
var ErrProfileNotFound = errors.New("profile not found")

// ProfileRepository defines read operations for profiles.
type ProfileRepository interface {
	GetProfileByID(ctx context.Context, id string) (*models.Profile, error)
}

type profileRepository struct {
	db *gorm.DB
}

// NewProfileRepository instantiates ProfileRepository.
func NewProfileRepository(db *gorm.DB) ProfileRepository {
	return &profileRepository{db: db}
}

func (r *profileRepository) GetProfileByID(ctx context.Context, id string) (*models.Profile, error) {
	var profile models.Profile
	if err := r.db.WithContext(ctx).First(&profile, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrProfileNotFound
		}
		return nil, err
	}
	return &profile, nil
}
