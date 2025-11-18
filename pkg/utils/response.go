package utils

import (
	"github.com/gin-gonic/gin"
)

// RespondSuccess standardizes successful responses.
func RespondSuccess(ctx *gin.Context, statusCode int, data interface{}) {
	ctx.JSON(statusCode, gin.H{
		"status": "success",
		"data":   data,
	})
}

// RespondError standardizes error responses.
func RespondError(ctx *gin.Context, statusCode int, message string, err error) {
	payload := gin.H{
		"status":  "error",
		"message": message,
	}
	if err != nil {
		payload["error"] = err.Error()
	}
	ctx.JSON(statusCode, payload)
}
