// ClienteDataDisplay.js
import React from "react";
import { Weight, Target, User } from "lucide-react";

const ClienteDataDisplay = ({ cliente }) => {
  if (!cliente) return null;

  // Mapear valores a etiquetas legibles
  const getNivelPilotajeLabel = (nivel) => {
    const niveles = {
      principiante: "Principiante",
      novato: "Novato",
      intermedio: "Intermedio",
      experto: "Experto",
      profesional: "Profesional",
    };
    return niveles[nivel] || nivel;
  };

  // Verificar si tiene datos del cuestionario
  const tieneRespuestas = cliente.peso || cliente.nivelPilotaje;

  if (!tieneRespuestas) {
    return null; // No mostrar nada si no hay respuestas
  }

  const customerDataPilotaje = [
    {
      icon: Weight,
      label: "Peso",
      value: cliente.peso ? `${cliente.peso} kg` : null,
    },
    {
      icon: Target,
      label: "Nivel",
      value: cliente.nivelPilotaje
        ? getNivelPilotajeLabel(cliente.nivelPilotaje)
        : null,
    },
  ].filter((item) => item.value); // Solo mostrar items que tienen valor

  return (
    <div className="uleach-customer-compact__info">
      {customerDataPilotaje.map((item, index) => {
        const IconComponent = item.icon;
        return (
          <div key={index} className="info-item">
            <IconComponent className="info-icon" />
            <span className="info-text">{item.value}</span>
          </div>
        );
      })}
    </div>
  );
};

export default ClienteDataDisplay;
