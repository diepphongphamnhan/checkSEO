package db

import (
	"fmt"
	"log"
	"os"
	"path/filepath"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"seo-ux-analyzer/internal/models"
)

type Storage struct {
	DB *gorm.DB
}

// InitDatabase khởi tạo kết nối SQLite và tự động AutoMigrate
func InitDatabase(dbPath string) (*Storage, error) {
	if dbPath == "" {
		homeDir, err := os.UserHomeDir()
		if err != nil {
			dbPath = "seo_ux_analyzer.db"
		} else {
			appDir := filepath.Join(homeDir, ".seo_ux_analyzer")
			_ = os.MkdirAll(appDir, 0755)
			dbPath = filepath.Join(appDir, "analyzer.db")
		}
	}

	gormConfig := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	}

	database, err := gorm.Open(sqlite.Open(dbPath), gormConfig)
	if err != nil {
		return nil, fmt.Errorf("không thể mở cơ sở dữ liệu SQLite tại %s: %w", dbPath, err)
	}

	// Tự động Migration schema
	log.Printf("[DB] Bắt đầu tự động migrate database SQLite: %s\n", dbPath)
	err = database.AutoMigrate(
		&models.AuditSession{},
		&models.SEOResult{},
		&models.UXStepResult{},
	)
	if err != nil {
		return nil, fmt.Errorf("lỗi khi AutoMigrate database: %w", err)
	}
	log.Printf("[DB] AutoMigrate thành công!\n")

	return &Storage{DB: database}, nil
}

// CreateAuditSession lưu phiên phân tích mới vào DB
func (s *Storage) CreateAuditSession(session *models.AuditSession) error {
	return s.DB.Create(session).Error
}

// GetAllSessions lấy danh sách tất cả các phiên phân tích sắp xếp mới nhất
func (s *Storage) GetAllSessions() ([]models.AuditSession, error) {
	var sessions []models.AuditSession
	err := s.DB.
		Preload("SEOResult").
		Preload("UXStepResults").
		Order("created_at DESC").
		Find(&sessions).Error
	return sessions, err
}

// GetSessionByID lấy chi tiết 1 phiên phân tích theo ID
func (s *Storage) GetSessionByID(id uint) (*models.AuditSession, error) {
	var session models.AuditSession
	err := s.DB.
		Preload("SEOResult").
		Preload("UXStepResults").
		First(&session, id).Error
	if err != nil {
		return nil, err
	}
	return &session, nil
}

// DeleteSession xóa phiên phân tích
func (s *Storage) DeleteSession(id uint) error {
	return s.DB.Delete(&models.AuditSession{}, id).Error
}
