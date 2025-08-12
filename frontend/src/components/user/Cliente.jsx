import React, { useState, useEffect } from "react";
import UleachCustomUser from "./UleachCustomUser";
import ClienteQuestionario from "./ClienteQuestionario";
import api from "../../../services/Api";

function Cliente({ listCustom, listBikes }) {
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [questionnaireType, setQuestionnaireType] = useState("first-time"); // 'first-time' o 'confirmation'
  const [clienteMotos, setClienteMotos] = useState([]);

  // Aquí defines qué cliente mostrar (en tu caso índice 1)
  const indexToRender = 5;
  const customToRender = [indexToRender];

  useEffect(() => {
    if (!customToRender) return;

    // Verificar si es la primera vez que el cliente accede
    checkClienteStatus();

    // Cargar las motos del cliente
    if (customToRender.cif) {
      loadClienteMotos();
    }
  }, [customToRender]);

  const checkClienteStatus = async () => {
    try {
      // PARA TESTING: Forzar que aparezca el cuestionario
      // Cambia esto por la lógica real cuando esté todo funcionando
      const clienteCompleto = false; // ← Forzado para testing

      // Lógica real (descomenta cuando quieras la funcionalidad completa):
      // const clienteCompleto = customToRender.peso && customToRender.nivelPilotaje;

      if (!clienteCompleto) {
        setQuestionnaireType("first-time");
        setShowQuestionnaire(true);
        return;
      }

      // Verificar si necesita confirmación anual
      const fechaUltimaConfirmacion = customToRender.fechaUltimaConfirmacion;
      const ahora = new Date();
      const unAnoAtras = new Date(
        ahora.getFullYear() - 1,
        ahora.getMonth(),
        ahora.getDate()
      );

      if (
        !fechaUltimaConfirmacion ||
        new Date(fechaUltimaConfirmacion) < unAnoAtras
      ) {
        setQuestionnaireType("confirmation");
        setShowQuestionnaire(true);
      }
    } catch (error) {
      console.error("Error verificando estado del cliente:", error);
    }
  };

  const loadClienteMotos = async () => {
    try {
      const motos = await api.getMotosByCif(customToRender.cif);
      setClienteMotos(Array.isArray(motos) ? motos : []);
    } catch (error) {
      console.error("Error cargando motos:", error);
      setClienteMotos([]);
    }
  };

  const handleQuestionnaireComplete = async (formData) => {
    try {
      console.log("📝 Enviando datos del cuestionario:", formData);

      // Guardar en la base de datos
      const result = await api.saveQuestionnaire(formData);

      if (result.success) {
        setShowQuestionnaire(false);
        alert("✅ Datos guardados correctamente en la base de datos!");

        // Opcional: recargar datos del cliente para mostrar los nuevos valores
        window.location.reload();
      } else {
        throw new Error(result.message || "Error desconocido");
      }
    } catch (error) {
      console.error("Error guardando datos:", error);
      alert("❌ Error al guardar los datos: " + error.message);
    }
  };
  const handleQuestionnaireSkip = () => {
    // Solo permitir omitir si no es confirmación anual
    if (questionnaireType === "first-time") {
      setShowQuestionnaire(false);
    }
  };

  // Si no hay cliente, mostrar mensaje
  if (!customToRender) {
    return <p>No hay datos de cliente para mostrar.</p>;
  }

  // Si debe mostrar cuestionario, mostrarlo
  if (showQuestionnaire) {
    return (
      <div className="cliente-container">
        <div className="questionnaire-wrapper">
          <div className="questionnaire-intro">
            <h1>
              {questionnaireType === "first-time"
                ? `¡Bienvenido ${customToRender.nombre}!`
                : "Confirmación anual de datos"}
            </h1>
            <p>
              {questionnaireType === "first-time"
                ? "Para brindarte el mejor servicio, necesitamos conocer algunos datos importantes sobre ti y tus motocicletas."
                : "Para mantener tu configuración de suspensión optimizada, confirmemos tus datos actuales."}
            </p>

            <ClienteQuestionario
              cliente={customToRender}
              motocicletas={clienteMotos}
              onComplete={handleQuestionnaireComplete}
              onSkip={handleQuestionnaireSkip}
              esConfirmacion={questionnaireType === "confirmation"}
            />
          </div>
        </div>
      </div>
    );
  }

  // Mostrar el componente normal del cliente
  return (
    <div className="cliente-container">
      <UleachCustomUser
        key={customToRender.id}
        Custom={customToRender}
        listBikes={listBikes}
      />

      {/* Botón para volver a abrir el cuestionario si necesario */}
      <div className="cliente-actions">
        <button
          onClick={() => {
            setQuestionnaireType("confirmation");
            setShowQuestionnaire(true);
          }}
          className="btn-update-data"
        >
          Actualizar mis datos
        </button>
      </div>
    </div>
  );
}

export default Cliente;
