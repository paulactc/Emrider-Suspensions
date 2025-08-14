import React from "react";
import { Navigation, Mountain, Settings, MapPin } from "lucide-react";

const MotoDataDisplay = ({ moto }) => {
  console.log("🐛 MotoDataDisplay - Props recibidas:", moto);

  if (!moto) {
    console.log("🐛 MotoDataDisplay - Sin moto, no se renderiza");
    return null;
  }

  // Función segura para obtener valores
  const getSafeValue = (value, fallback = null) => {
    return value !== null && value !== undefined && value !== ""
      ? value
      : fallback;
  };

  // Obtener valores de manera segura (tanto camelCase como snake_case)
  const especialidad = getSafeValue(moto.especialidad);
  const tipoConduccion =
    getSafeValue(moto.tipoConduccion) || getSafeValue(moto.tipo_conduccion);
  const preferenciaRigidez =
    getSafeValue(moto.preferenciaRigidez) ||
    getSafeValue(moto.preferencia_rigidez);

  console.log("🐛 MotoDataDisplay - Valores extraídos:", {
    especialidad,
    tipoConduccion,
    preferenciaRigidez,
  });

  // Mapear valores a etiquetas legibles
  const getEspecialidadInfo = (esp) => {
    const especialidades = {
      onroad: { label: "On Road", icon: Navigation },
      offroad: { label: "Off Road", icon: Mountain },
    };
    return especialidades[esp] || { label: esp, icon: Settings };
  };

  const getTipoConduccionLabel = (tipo) => {
    const tipos = {
      calle: "Calle",
      "circuito-asfalto": "Circuito Asfalto",
      "circuito-tierra": "Circuito Tierra",
    };
    return tipos[tipo] || tipo;
  };

  const getPreferenciaRigidezLabel = (preferencia) => {
    const preferencias = {
      blando: "Más Blando",
      duro: "Más Duro",
    };
    return preferencias[preferencia] || preferencia;
  };

  // Crear array de datos de configuración solo con valores que existen
  const configData = [];

  if (especialidad) {
    const especialidadInfo = getEspecialidadInfo(especialidad);
    configData.push({
      icon: especialidadInfo.icon,
      label: "Especialidad",
      value: especialidadInfo.label,
    });
  }

  if (tipoConduccion) {
    configData.push({
      icon: MapPin,
      label: "Conducción",
      value: getTipoConduccionLabel(tipoConduccion),
    });
  }

  if (preferenciaRigidez) {
    configData.push({
      icon: Settings,
      label: "Preferencia",
      value: getPreferenciaRigidezLabel(preferenciaRigidez),
    });
  }

  console.log("🐛 MotoDataDisplay - Items a renderizar:", configData);

  // Si no hay datos de configuración, mostrar mensaje informativo
  if (configData.length === 0) {
    console.log("🐛 MotoDataDisplay - Sin datos de configuración");
    return (
      <div className="listMotocicle__specs">
        <div
          style={{
            padding: "0.5rem",
            background: "#fff3cd",
            borderRadius: "4px",
            fontSize: "0.8em",
            color: "#856404",
          }}
        >
          ℹ️ Completa el cuestionario para ver la configuración de esta moto
        </div>
      </div>
    );
  }

  return (
    <div className="listMotocicle__specs">
      {configData.map((item, index) => {
        const IconComponent = item.icon;
        return (
          <div key={index} className="listMotocicle__spec-item">
            <IconComponent className="listMotocicle__spec-item-icon" />
            <span className="listMotocicle__spec-item-label">
              {item.label}:
            </span>
            <span className="listMotocicle__spec-item-value">{item.value}</span>
          </div>
        );
      })}
    </div>
  );
};

export default MotoDataDisplay;
