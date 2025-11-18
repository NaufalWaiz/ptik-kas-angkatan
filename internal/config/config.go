package config

import (
	"fmt"
	"os"
)

// Config represents application-wide configuration loaded from environment variables.
type Config struct {
	Port                  string
	AppEnv                string
	SupabaseJWTSecret     string
	SupabaseProjectURL    string
	SupabaseServiceKey    string
	SupabaseAnonPublicKey string
	Database              DatabaseConfig
}

// DatabaseConfig groups the settings required to connect to the Supabase PostgreSQL instance.
type DatabaseConfig struct {
	Host     string
	User     string
	Password string
	Name     string
	Port     string
	SSLMode  string
}

// LoadConfig reads environment variables into a Config structure.
func LoadConfig() (*Config, error) {
	cfg := &Config{
		Port:                  getEnv("PORT", "8080"),
		AppEnv:                getEnv("APP_ENV", "development"),
		SupabaseJWTSecret:     os.Getenv("SUPABASE_JWT_SECRET"),
		SupabaseProjectURL:    os.Getenv("SUPABASE_PROJECT_URL"),
		SupabaseServiceKey:    os.Getenv("SUPABASE_SERVICE_KEY"),
		SupabaseAnonPublicKey: os.Getenv("SUPABASE_ANON_KEY"),
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", ""),
			User:     getEnv("DB_USER", ""),
			Password: getEnv("DB_PASSWORD", ""),
			Name:     getEnv("DB_NAME", ""),
			Port:     getEnv("DB_PORT", "6543"),
			SSLMode:  getEnv("DB_SSL_MODE", "require"),
		},
	}

	if cfg.SupabaseJWTSecret == "" {
		return nil, fmt.Errorf("SUPABASE_JWT_SECRET is required")
	}
	if cfg.Database.Host == "" || cfg.Database.User == "" || cfg.Database.Password == "" || cfg.Database.Name == "" {
		return nil, fmt.Errorf("database configuration is incomplete")
	}
	if cfg.SupabaseProjectURL == "" || cfg.SupabaseServiceKey == "" || cfg.SupabaseAnonPublicKey == "" {
		return nil, fmt.Errorf("supabase project url, service key, and anon key are required")
	}

	return cfg, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
