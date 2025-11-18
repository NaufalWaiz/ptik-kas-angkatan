package controllers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"kas-angkatan/internal/config"
	"kas-angkatan/pkg/utils"

	"github.com/gin-gonic/gin"
)

// AuthController proxies login and register requests to Supabase Auth.
type AuthController struct {
	baseURL    string
	serviceKey string
	anonKey    string
	httpClient *http.Client
}

// NewAuthController creates a new AuthController instance.
func NewAuthController(cfg *config.Config) *AuthController {
	return &AuthController{
		baseURL:    strings.TrimRight(cfg.SupabaseProjectURL, "/"),
		serviceKey: cfg.SupabaseServiceKey,
		anonKey:    cfg.SupabaseAnonPublicKey,
		httpClient: &http.Client{
			Timeout: 15 * time.Second,
		},
	}
}

type registerRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

// Register forwards registration requests to Supabase Auth.
func (c *AuthController) Register(ctx *gin.Context) {
	var payload registerRequest
	if err := ctx.ShouldBindJSON(&payload); err != nil {
		utils.RespondError(ctx, http.StatusBadRequest, "invalid request payload", err)
		return
	}

	body, _ := json.Marshal(payload)
	url := fmt.Sprintf("%s/auth/v1/signup", c.baseURL)
	respBody, status, err := c.doSupabaseRequest(ctx, url, c.serviceKey, body)
	if err != nil {
		utils.RespondError(ctx, status, "failed to register user", err)
		return
	}

	ctx.Data(status, "application/json", respBody)
}

type loginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// Login exchanges email/password for a Supabase session token.
func (c *AuthController) Login(ctx *gin.Context) {
	var payload loginRequest
	if err := ctx.ShouldBindJSON(&payload); err != nil {
		utils.RespondError(ctx, http.StatusBadRequest, "invalid request payload", err)
		return
	}

	body, _ := json.Marshal(payload)
	url := fmt.Sprintf("%s/auth/v1/token?grant_type=password", c.baseURL)
	respBody, status, err := c.doSupabaseRequest(ctx, url, c.anonKey, body)
	if err != nil {
		utils.RespondError(ctx, status, "failed to login", err)
		return
	}

	ctx.Data(status, "application/json", respBody)
}

func (c *AuthController) doSupabaseRequest(ctx *gin.Context, url, apiKey string, body []byte) ([]byte, int, error) {
	req, err := http.NewRequestWithContext(ctx.Request.Context(), http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return nil, http.StatusInternalServerError, err
	}
	req.Header.Set("apikey", apiKey)
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, http.StatusBadGateway, err
	}
	defer resp.Body.Close()

	respBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, http.StatusBadGateway, err
	}

	if resp.StatusCode >= 400 {
		return respBytes, resp.StatusCode, fmt.Errorf("supabase returned %d: %s", resp.StatusCode, string(respBytes))
	}

	return respBytes, resp.StatusCode, nil
}
