-- Migración: Agregar columna gdtaller_id a las tablas clientes y motos
-- Para sincronización con la API de GDTaller

-- Agregar gdtaller_id a la tabla clientes
ALTER TABLE clientes
ADD COLUMN IF NOT EXISTS gdtaller_id VARCHAR(50) NULL,
ADD INDEX idx_gdtaller_id (gdtaller_id);

-- Agregar gdtaller_id a la tabla motos
ALTER TABLE motos
ADD COLUMN IF NOT EXISTS gdtaller_id VARCHAR(50) NULL,
ADD INDEX idx_motos_gdtaller_id (gdtaller_id);

-- Nota: Si MySQL no soporta IF NOT EXISTS para ADD COLUMN, usar las siguientes consultas alternativas:

-- Para verificar y agregar en clientes:
-- SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'clientes' AND COLUMN_NAME = 'gdtaller_id');
-- SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE clientes ADD COLUMN gdtaller_id VARCHAR(50) NULL', 'SELECT "Column already exists"');
-- PREPARE stmt FROM @sqlstmt;
-- EXECUTE stmt;

-- Para verificar y agregar en motos:
-- SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'motos' AND COLUMN_NAME = 'gdtaller_id');
-- SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE motos ADD COLUMN gdtaller_id VARCHAR(50) NULL', 'SELECT "Column already exists"');
-- PREPARE stmt FROM @sqlstmt;
-- EXECUTE stmt;
