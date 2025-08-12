import React, { useState, useEffect, useMemo } from "react";
import UleachCustomUser from "./UleachCustomUser";
import ClienteQuestionario from "./ClienteQuestionario";
// ✅ CORREGIDO: Ruta de importación del API
import api from "../../../services/Api";

function Cliente({ listCustom, listBikes }) {
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [questionnaireType, setQuestionnaireType] = useState("first-time");
  const [clienteMotos, setClienteMotos] = useState([]);
  const [customToRender, setCustomToRender] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔧 CONFIGURACIÓN: Cambia este índice para el cliente que quieres mostrar
  const CLIENTE_INDEX = 3; // 0=primer cliente, 1=segundo cliente, etc.

  // ⚙️ Array de motos con referencia estable (añadido)
  const motosNormalizadas = useMemo(() => {
    return (clienteMotos || []).map((m, i) => ({
      id: m.id ?? m.motoId ?? m._id ?? `${customToRender?.cif || "CIF"}-${i}`,
      marca: m.marca ?? m.Marca ?? m.brand ?? "Desconocida",
      modelo: m.modelo ?? m.Modelo ?? m.model ?? "Sin modelo",
      anio: m.anio ?? m.Año ?? m.year ?? null,
      matricula: m.matricula ?? m.Matricula ?? m.plate ?? "",
      bastidor: m.bastidor ?? m.Bastidor ?? m.vin ?? "",
    }));
  }, [clienteMotos, customToRender?.cif]);

  useEffect(() => {
    const cargarDatosCliente = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("🔍 Iniciando carga de cliente...");
        console.log("📊 listCustom recibido:", listCustom);

        let cliente = null;

        // ✅ OPCIÓN 1: Usar listCustom si está disponible y no está vacío
        if (listCustom && Array.isArray(listCustom) && listCustom.length > 0) {
          console.log("✅ Usando datos de listCustom");
          console.log("📋 Total clientes en listCustom:", listCustom.length);

          if (listCustom.length > CLIENTE_INDEX) {
            cliente = listCustom[CLIENTE_INDEX];
            console.log("👤 Cliente seleccionado desde listCustom:", cliente);
          } else {
            console.log("⚠️ Índice fuera de rango, tomando el primer cliente");
            cliente = listCustom[0];
          }
        }

        // ✅ OPCIÓN 2: Si no hay listCustom, intentar cargar desde API
        if (!cliente) {
          console.log("🌐 Cargando clientes desde API...");
          try {
            const clientesFromAPI = await api.getClientes();
            console.log("📦 Clientes desde API:", clientesFromAPI);

            if (
              clientesFromAPI &&
              Array.isArray(clientesFromAPI) &&
              clientesFromAPI.length > 0
            ) {
              if (clientesFromAPI.length > CLIENTE_INDEX) {
                cliente = clientesFromAPI[CLIENTE_INDEX];
              } else {
                cliente = clientesFromAPI[0];
              }
              console.log("👤 Cliente seleccionado desde API:", cliente);
            }
          } catch (apiError) {
            console.error("❌ Error cargando desde API:", apiError);
            // Continuamos sin cliente, se mostrará el estado de error
          }
        }

        // ✅ VALIDACIÓN: Verificar que tenemos un cliente válido
        if (!cliente) {
          throw new Error(
            "No se pudo cargar ningún cliente. Verifica que hay datos en la base de datos."
          );
        }

        if (!cliente.id) {
          throw new Error("El cliente no tiene un ID válido");
        }

        // ✅ VALIDACIÓN: Agregar valores por defecto para campos faltantes
        if (!cliente.nombre && !cliente.apellidos) {
          console.warn("⚠️ Cliente sin nombre:", cliente);
          cliente = {
            ...cliente,
            nombre: cliente.nombre || "Cliente",
            apellidos: cliente.apellidos || "Sin nombre",
          };
        }

        console.log("✅ Cliente final para renderizar:", cliente);
        setCustomToRender(cliente);

        // 🏍️ Cargar motos del cliente si tiene CIF
        if (cliente.cif) {
          console.log("🏍️ Cargando motos para CIF:", cliente.cif);
          await loadClienteMotos(cliente.cif);
        } else {
          console.log("⚠️ Cliente sin CIF, no se pueden cargar motos");
          setClienteMotos([]); // Array vacío si no hay CIF
        }

        // 📋 Verificar estado del cuestionario
        await checkClienteStatus(cliente);
      } catch (err) {
        console.error("❌ Error cargando cliente:", err);
        setError(err.message || "Error cargando datos del cliente");
      } finally {
        setLoading(false);
      }
    };

    cargarDatosCliente();
  }, [listCustom, CLIENTE_INDEX]);

  const checkClienteStatus = async (cliente) => {
    try {
      console.log("🔍 Verificando estado del cuestionario...");
      console.log("📊 Datos del cliente para cuestionario:", {
        peso: cliente.peso,
        nivelPilotaje: cliente.nivelPilotaje,
        fechaUltimaConfirmacion: cliente.fechaUltimaConfirmacion,
      });

      // Verificar si el cliente tiene datos del cuestionario
      const tieneRespuestas = cliente.peso && cliente.nivelPilotaje;

      if (!tieneRespuestas) {
        console.log("❗ Cliente necesita completar cuestionario inicial");
        setQuestionnaireType("first-time");
        setShowQuestionnaire(true);
        return;
      }

      // Verificar si necesita confirmación anual
      const fechaUltimaConfirmacion = cliente.fechaUltimaConfirmacion;
      if (fechaUltimaConfirmacion) {
        const ahora = new Date();
        const unAnoAtras = new Date(
          ahora.getFullYear() - 1,
          ahora.getMonth(),
          ahora.getDate()
        );
        const fechaConfirmacion = new Date(fechaUltimaConfirmacion);

        if (fechaConfirmacion < unAnoAtras) {
          console.log("⏰ Cliente necesita confirmación anual");
          setQuestionnaireType("confirmation");
          setShowQuestionnaire(true);
        } else {
          console.log("✅ Cliente no necesita cuestionario");
        }
      }
    } catch (error) {
      console.error("Error verificando estado del cuestionario:", error);
    }
  };

  const loadClienteMotos = async (cif) => {
    try {
      console.log("🔍 Buscando motos para CIF:", cif);

      if (!cif) {
        console.log("⚠️ CIF vacío, no se pueden cargar motos");
        setClienteMotos([]);
        return;
      }

      const motos = await api.getMotosByCif(cif);
      console.log("🏍️ Motos encontradas:", motos);
      setClienteMotos(motos || []);
    } catch (error) {
      console.error("❌ Error cargando motos:", error);
      setClienteMotos([]);
    }
  };

  const handleQuestionnaireComplete = async (formData) => {
    try {
      console.log("📝 Guardando cuestionario:", formData);

      const result = await api.saveQuestionnaire(formData);
      console.log("📤 Resultado del guardado:", result);

      if (result && result.success) {
        console.log("✅ Cuestionario guardado exitosamente");
        setShowQuestionnaire(false);
        alert("✅ ¡Datos guardados correctamente!");

        // Actualizar datos locales del cliente
        setCustomToRender((prev) => ({
          ...prev,
          peso: formData.cliente.peso,
          nivelPilotaje: formData.cliente.nivelPilotaje,
          fechaUltimaConfirmacion: new Date().toISOString(),
        }));

        // Recargar motos con nuevos datos
        if (customToRender?.cif) {
          await loadClienteMotos(customToRender.cif);
        }
      } else {
        throw new Error(result?.message || "Error desconocido al guardar");
      }
    } catch (error) {
      console.error("❌ Error guardando cuestionario:", error);
      alert("❌ Error al guardar: " + error.message);
    }
  };

  const handleQuestionnaireSkip = () => {
    if (questionnaireType === "first-time") {
      console.log("⏭️ Omitiendo cuestionario inicial");
      setShowQuestionnaire(false);
    }
  };

  // 🔄 ESTADO DE CARGA
  if (loading) {
    return (
      <div className="cliente-container">
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            background: "#f0f0f0",
            borderRadius: "8px",
            margin: "2rem",
          }}
        >
          <h2>🔄 Cargando datos del cliente...</h2>
          <p>Por favor espera mientras cargamos tu información.</p>
        </div>
      </div>
    );
  }

  // ❌ ESTADO DE ERROR
  if (error) {
    return (
      <div className="cliente-container">
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            background: "#ffebee",
            borderRadius: "8px",
            margin: "2rem",
            border: "1px solid #f44336",
          }}
        >
          <h2>❌ Error al cargar datos</h2>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: "#f44336",
              color: "white",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              cursor: "pointer",
              marginTop: "1rem",
            }}
          >
            🔄 Recargar página
          </button>
        </div>
      </div>
    );
  }

  // ❌ SIN DATOS DE CLIENTE
  if (!customToRender) {
    return (
      <div className="cliente-container">
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            background: "#fff3e0",
            borderRadius: "8px",
            margin: "2rem",
            border: "1px solid #ff9800",
          }}
        >
          <h2>⚠️ No se encontraron datos del cliente</h2>
          <p>No pudimos cargar la información del cliente.</p>
          <p>
            <strong>Posibles soluciones:</strong>
          </p>
          <ul style={{ textAlign: "left", display: "inline-block" }}>
            <li>Verifica que hay clientes en la base de datos</li>
            <li>Cambia el valor de CLIENTE_INDEX en el código (línea 14)</li>
            <li>Revisa la consola del navegador para más detalles</li>
            <li>Verifica que el servicio API está funcionando</li>
          </ul>
        </div>
      </div>
    );
  }

  // 📋 MOSTRAR CUESTIONARIO
  if (showQuestionnaire) {
    return (
      <div className="cliente-container">
        <div className="questionnaire-wrapper">
          <div className="questionnaire-intro">
            <h1>
              {questionnaireType === "first-time"
                ? `¡Bienvenido ${customToRender.nombre || "Cliente"}!`
                : "Confirmación anual de datos"}
            </h1>
            <p>
              {questionnaireType === "first-time"
                ? "Para brindarte el mejor servicio, necesitamos conocer algunos datos importantes sobre ti y tus motocicletas."
                : "Para mantener tu configuración de suspensión optimizada, confirmemos tus datos actuales."}
            </p>

            <ClienteQuestionario
              cliente={customToRender}
              motos={motosNormalizadas}
              onComplete={handleQuestionnaireComplete}
              onSkip={handleQuestionnaireSkip}
              esConfirmacion={questionnaireType === "confirmation"}
            />
          </div>
        </div>
      </div>
    );
  }

  // ✅ MOSTRAR CLIENTE NORMAL
  return (
    <div className="cliente-container">
      {/* 🐛 INFORMACIÓN DE DEBUG */}
      <div
        style={{
          background: "#e8f5e8",
          padding: "1rem",
          margin: "1rem",
          borderRadius: "4px",
          border: "1px solid #4caf50",
          fontSize: "0.9em",
        }}
      >
        <strong>🐛 INFORMACIÓN DE DEBUG:</strong>
        <br />
        Cliente ID: {customToRender.id}
        <br />
        Nombre: {customToRender.nombre}
        <br />
        Apellidos: {customToRender.apellidos}
        <br />
        CIF: {customToRender.cif || "No disponible"}
        <br />
        Peso: {customToRender.peso || "No definido"}
        <br />
        Nivel Pilotaje: {customToRender.nivelPilotaje || "No definido"}
        <br />
        Motos cargadas: {clienteMotos.length}
      </div>

      <UleachCustomUser
        key={customToRender.id}
        Custom={customToRender}
        listBikes={listBikes}
      />

      {/* Botón para actualizar datos */}
      <div
        className="cliente-actions"
        style={{ padding: "1rem", textAlign: "center" }}
      >
        <button
          onClick={() => {
            setQuestionnaireType("confirmation");
            setShowQuestionnaire(true);
          }}
          style={{
            background: "#4caf50",
            color: "white",
            border: "none",
            padding: "0.75rem 1.5rem",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          📝 Actualizar mis datos
        </button>
      </div>
    </div>
  );
}

export default Cliente;
