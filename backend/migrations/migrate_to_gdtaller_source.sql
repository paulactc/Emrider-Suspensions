-- Migración: GDTaller como fuente de verdad para clientes y motos
-- Solo guardamos en MySQL los datos propios de Emrider (cuestionario, servicios)

-- 1. Crear tabla cuestionario_clientes
CREATE TABLE IF NOT EXISTS cuestionario_clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cif VARCHAR(50) NOT NULL UNIQUE,
  peso DECIMAL(5,2) NULL,
  nivel_pilotaje VARCHAR(50) NULL,
  fecha_ultima_confirmacion DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_cuestionario_clientes_cif (cif)
);

-- 2. Crear tabla cuestionario_motos
CREATE TABLE IF NOT EXISTS cuestionario_motos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  matricula VARCHAR(20) NOT NULL UNIQUE,
  especialidad VARCHAR(50) NULL,
  tipo_conduccion VARCHAR(50) NULL,
  preferencia_rigidez VARCHAR(50) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_cuestionario_motos_matricula (matricula)
);

-- 3. Migrar datos existentes de clientes -> cuestionario_clientes
INSERT IGNORE INTO cuestionario_clientes (cif, peso, nivel_pilotaje, fecha_ultima_confirmacion)
SELECT cif, peso, nivel_pilotaje, fecha_ultima_confirmacion
FROM clientes
WHERE cif IS NOT NULL
  AND cif != ''
  AND (peso IS NOT NULL OR nivel_pilotaje IS NOT NULL);

-- 4. Migrar datos existentes de motos -> cuestionario_motos
INSERT IGNORE INTO cuestionario_motos (matricula, especialidad, tipo_conduccion, preferencia_rigidez)
SELECT matricula, especialidad, tipo_conduccion, preferencia_rigidez
FROM motos
WHERE matricula IS NOT NULL
  AND matricula != ''
  AND (especialidad IS NOT NULL OR tipo_conduccion IS NOT NULL OR preferencia_rigidez IS NOT NULL);

-- 5. Agregar columnas cif_cliente y matricula_moto a servicios_info
ALTER TABLE servicios_info
  ADD COLUMN IF NOT EXISTS cif_cliente VARCHAR(50) NULL,
  ADD COLUMN IF NOT EXISTS matricula_moto VARCHAR(20) NULL;

-- 6. Rellenar columnas nuevas de servicios_info desde joins con tablas antiguas
UPDATE servicios_info si
  JOIN clientes c ON si.cliente_id = c.id
  SET si.cif_cliente = c.cif
  WHERE si.cif_cliente IS NULL AND c.cif IS NOT NULL;

UPDATE servicios_info si
  JOIN motos m ON si.moto_id = m.id
  SET si.matricula_moto = m.matricula
  WHERE si.matricula_moto IS NULL AND m.matricula IS NOT NULL;
