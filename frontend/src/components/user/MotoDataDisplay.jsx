import React from "react";
import { Navigation, Mountain, Settings, MapPin } from "lucide-react";

const MotoDataDisplay = ({ moto }) => {
  if (!moto) return null;

  // Mapear valores a etiquetas legibles
  const getEspecialidadInfo = (especialidad) => {
    const especialidades = {
      onroad: { label: "On Road", icon: Navigation },
      offroad: { label: "Off Road", icon: Mountain },
    };
    return (
      especialidades[especialidad] || { label: especialidad, icon: Settings }
    );
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

  // Crear array de datos de configuración
  const configData = [];

  if (moto.especialidad) {
    const especialidadInfo = getEspecialidadInfo(moto.especialidad);
    configData.push({
      icon: especialidadInfo.icon,
      label: "Especialidad",
      value: especialidadInfo.label,
    });
  }

  if (moto.tipoConduccion) {
    configData.push({
      icon: MapPin,
      label: "Conducción",
      value: getTipoConduccionLabel(moto.tipoConduccion),
    });
  }

  if (moto.preferenciaRigidez) {
    configData.push({
      icon: Settings,
      label: "Preferencia",
      value: getPreferenciaRigidezLabel(moto.preferenciaRigidez),
    });
  }

  // Si no hay datos de configuración, no mostrar nada
  if (configData.length === 0) {
    return null;
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
