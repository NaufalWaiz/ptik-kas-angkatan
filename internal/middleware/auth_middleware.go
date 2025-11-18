package middleware

import (
	"errors"
	"net/http"
	"strings"

	"kas-angkatan/internal/repository"
	"kas-angkatan/pkg/utils"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// AuthMiddleware validates Supabase JWT tokens and enforces role-based access.
type AuthMiddleware struct {
	profileRepo repository.ProfileRepository
	jwtSecret   []byte
}

// NewAuthMiddleware constructs the JWT middleware.
func NewAuthMiddleware(profileRepo repository.ProfileRepository, jwtSecret string) *AuthMiddleware {
	return &AuthMiddleware{
		profileRepo: profileRepo,
		jwtSecret:   []byte(jwtSecret),
	}
}

// RequireRoles validates JWT token and ensures the caller has one of the allowed roles.
func (m *AuthMiddleware) RequireRoles(roles ...string) gin.HandlerFunc {
	allowedRoles := make(map[string]struct{})
	for _, role := range roles {
		allowedRoles[strings.ToLower(role)] = struct{}{}
	}

	return func(ctx *gin.Context) {
		userID, role, err := m.validateToken(ctx)
		if err != nil {
			utils.RespondError(ctx, http.StatusUnauthorized, "unauthorized", err)
			ctx.Abort()
			return
		}

		if _, ok := allowedRoles[strings.ToLower(role)]; !ok {
			utils.RespondError(ctx, http.StatusForbidden, "insufficient role permissions", nil)
			ctx.Abort()
			return
		}

		ctx.Set("currentUserID", userID)
		ctx.Set("currentUserRole", role)
		ctx.Next()
	}
}

func (m *AuthMiddleware) validateToken(ctx *gin.Context) (string, string, error) {
	authHeader := ctx.GetHeader("Authorization")
	if authHeader == "" {
		return "", "", errors.New("missing Authorization header")
	}

	parts := strings.SplitN(authHeader, " ", 2)
	if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
		return "", "", errors.New("invalid Authorization header format")
	}

	tokenString := parts[1]

	token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return m.jwtSecret, nil
	})
	if err != nil || !token.Valid {
		return "", "", errors.New("invalid or expired token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return "", "", errors.New("unable to parse token claims")
	}

	subClaim, ok := claims["sub"].(string)
	if !ok || subClaim == "" {
		return "", "", errors.New("missing subject claim")
	}

	profile, err := m.profileRepo.GetProfileByID(ctx.Request.Context(), subClaim)
	if err != nil {
		if errors.Is(err, repository.ErrProfileNotFound) {
			return "", "", errors.New("profile not found for token")
		}
		return "", "", err
	}

	return profile.ID.String(), profile.Role, nil
}
