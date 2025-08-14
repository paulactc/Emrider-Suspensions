import React from "react";
import { Weight, Target, User } from "lucide-react";

const ClienteDataDisplay = ({ cliente }) => {
  console.log("🐛 ClienteDataDisplay - Props recibidas:", cliente);

  // Validación temprana - si no hay cliente, no renderizar nada
  if (!cliente) {
    console.log("🐛 ClienteDataDisplay - Sin cliente, no se renderiza");
    return null;
  }

  // Función segura para obtener valores
  const getSafeValue = (value, fallback = null) => {
    return value !== null && value !== undefined && value !== ""
      ? value
      : fallback;
  };

  // Obtener peso de manera segura
  const peso = getSafeValue(cliente.peso);
  const nivelPilotaje =
    getSafeValue(cliente.nivelPilotaje) || getSafeValue(cliente.nivel_pilotaje);

  console.log("🐛 ClienteDataDisplay - Valores extraídos:", {
    peso,
    nivelPilotaje,
  });

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

  // Crear array de datos solo con valores que existen
  const customerDataPilotaje = [];

  if (peso) {
    customerDataPilotaje.push({
      icon: Weight,
      label: "Peso",
      value: `${peso} kg`,
    });
  }

  if (nivelPilotaje) {
    customerDataPilotaje.push({
      icon: Target,
      label: "Nivel",
      value: getNivelPilotajeLabel(nivelPilotaje),
    });
  }

  console.log(
    "🐛 ClienteDataDisplay - Items a renderizar:",
    customerDataPilotaje
  );

  // Si no hay datos del cuestionario, no mostrar nada
  if (customerDataPilotaje.length === 0) {
    console.log("🐛 ClienteDataDisplay - Sin datos del cuestionario");
    return (
      <div className="uleach-customer-compact__info">
        <div
          style={{
            padding: "0.5rem",
            background: "#646360ff",
            borderRadius: "4px",
            fontSize: "0.8em",
            color: "white",
          }}
        >
          ℹ️ Completa el cuestionario para ver tus datos de pilotaje
        </div>
      </div>
    );
  }

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
