package models

import (
	"time"

	"github.com/google/uuid"
)

// Profile mirrors the public.profiles table that stores RBAC data.
type Profile struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	FullName  string    `json:"full_name"`
	Role      string    `gorm:"type:varchar(20);default:member" json:"role"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (Profile) TableName() string {
	return "profiles"
}
