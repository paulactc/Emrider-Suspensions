import React, { useState, useEffect, useMemo } from "react";
import UleachCustomUser from "./UleachCustomUser";
import ClienteQuestionario from "./ClienteQuestionario";
import NotificationModal from "../common/NotificationModal";
import LoadingModal from "../common/LoadingModal";
// ✅ CORREGIDO: Ruta de importación del API
import api from "../../../services/Api";

function Cliente({ listCustom, listBikes }) {
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [questionnaireType, setQuestionnaireType] = useState("first-time");
  const [manualConfig, setManualConfig] = useState({ mode: "all", motoId: null });
  const [clienteMotos, setClienteMotos] = useState([]);
  const [customToRender, setCustomToRender] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notif, setNotif] = useState({ open: false, type: "success", message: "" });
  const showNotif = (type, message) => setNotif({ open: true, type, message });

  // Obtener DNI/CIF del usuario autenticado
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userCif = user.dni || "";

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

        // Buscar cliente por CIF/DNI del usuario autenticado
        const buscarClientePorCif = (clientes) => {
          if (!userCif || !Array.isArray(clientes)) return null;
          return clientes.find(
            (c) => c.cif && c.cif.toLowerCase() === userCif.toLowerCase()
          );
        };

        // OPCION 1: Buscar en listCustom para obtener el ID/CIF rápido
        if (listCustom && Array.isArray(listCustom) && listCustom.length > 0) {
          cliente = buscarClientePorCif(listCustom);
          console.log("Cliente encontrado en listCustom:", cliente);
        }

        // OPCION 2: Si no se encontro, buscar desde API
        if (!cliente) {
          try {
            const clientesFromAPI = await api.getClientes();
            cliente = buscarClientePorCif(clientesFromAPI);
            console.log("Cliente encontrado desde API:", cliente);
          } catch (apiError) {
            console.error("Error cargando desde API:", apiError);
          }
        }

        // Siempre obtener datos frescos del cliente individual (incluye cuestionario actualizado de BD)
        if (cliente && cliente.id) {
          try {
            const clienteFresco = await api.getCliente(cliente.id);
            if (clienteFresco) {
              cliente = { ...cliente, ...clienteFresco };
              console.log("Cliente actualizado con datos frescos:", cliente);
            }
          } catch (apiError) {
            console.log("No se pudieron obtener datos frescos, usando datos de listCustom");
          }
        }

        // Si GDTaller no tiene nombre, usar el nombre del usuario local (si no es el DNI)
        if (!cliente.nombre) {
          const dniRegex = /^[0-9]{8}[A-Za-z]$/;
          if (user.nombre && !dniRegex.test(user.nombre)) {
            cliente = { ...cliente, nombre: user.nombre };
          }
        }

        // Si no se encontró cliente en GDTaller, crear uno básico desde los datos del usuario registrado
        if (!cliente && userCif) {
          console.log("⚠️ Cliente no encontrado en GDTaller, usando datos locales del usuario");
          cliente = {
            id: userCif,
            cif: userCif,
            nombre: user.nombre || "Cliente",
            apellidos: "",
            email: user.email || "",
            telefono: user.telefono || "",
          };
        }

        // ✅ VALIDACIÓN: Verificar que tenemos un cliente válido
        if (!cliente) {
          throw new Error(
            "No se pudo cargar ningún cliente. Verifica que hay datos en la base de datos."
          );
        }

        if (!cliente.id) {
          cliente.id = userCif || "unknown";
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
  }, [listCustom, userCif]);

  const checkClienteStatus = async (cliente) => {
    try {
      const tieneRespuestas = cliente.peso && cliente.nivelPilotaje;
      if (!tieneRespuestas) {
        setQuestionnaireType("first-time");
        setManualConfig({ mode: "all", motoId: null });
        setShowQuestionnaire(true);
      }
    } catch (error) {
      console.error("Error verificando estado del cuestionario:", error);
    }
  };

  const handleOpenQuestionnaire = (mode = "all", motoId = null) => {
    setManualConfig({ mode, motoId });
    setQuestionnaireType("manual");
    setShowQuestionnaire(true);
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
        showNotif("success", "¡Datos guardados correctamente!");

        // Actualizar datos locales del cliente (solo si se guardaron datos del cliente)
        if (!formData.skipClientSave) {
          setCustomToRender((prev) => ({
            ...prev,
            peso: formData.cliente.peso,
            nivelPilotaje: formData.cliente.nivelPilotaje,
            fechaUltimaConfirmacion: new Date().toISOString(),
          }));
        }

        // Recargar motos con nuevos datos de cuestionario
        if (customToRender?.cif) {
          await loadClienteMotos(customToRender.cif);
        }
      } else {
        throw new Error(result?.message || "Error desconocido al guardar");
      }
    } catch (error) {
      console.error("❌ Error guardando cuestionario:", error);
      showNotif("error", "Error al guardar: " + error.message);
    }
  };

  const handleQuestionnaireSkip = () => {
    setShowQuestionnaire(false);
  };

  // 🔄 ESTADO DE CARGA
  if (loading) {
    return <LoadingModal message="Cargando datos del cliente..." />;
  }

  // ❌ ESTADO DE ERROR
  if (error) {
    return (
      <NotificationModal
        isOpen={true}
        type="error"
        message={error}
        onClose={() => window.location.reload()}
      />
    );
  }

  // ❌ SIN DATOS DE CLIENTE
  if (!customToRender) {
    return (
      <NotificationModal
        isOpen={true}
        type="error"
        message="No se pudieron cargar los datos del cliente. Inténtalo de nuevo."
        onClose={() => window.location.reload()}
      />
    );
  }

  // 📋 MOSTRAR CUESTIONARIO
  if (showQuestionnaire) {
    const motosParaCuestionario = manualConfig.motoId
      ? motosNormalizadas.filter(
          (m) => String(m.id) === String(manualConfig.motoId)
        )
      : motosNormalizadas;

    const questionnaireMode =
      manualConfig.mode === "moto"
        ? "moto-only"
        : manualConfig.mode === "cliente"
        ? "cliente-only"
        : "all";

    const introTitle =
      questionnaireType === "first-time"
        ? `¡Bienvenido ${customToRender.nombre || "Cliente"}!`
        : manualConfig.mode === "moto"
        ? "Configuración de suspensión"
        : "Cuestionario de pilotaje";

    const introText =
      questionnaireType === "first-time"
        ? "Para brindarte el mejor servicio, necesitamos conocer algunos datos importantes sobre ti y tus motocicletas."
        : manualConfig.mode === "moto"
        ? "Actualiza las preferencias de suspensión de tu moto."
        : "Actualiza tus datos de peso y nivel de pilotaje.";

    return (
      <div className="cliente-container">
        <div className="questionnaire-wrapper">
          <div className="questionnaire-intro">
            <h1>{introTitle}</h1>
            <p>{introText}</p>
            <ClienteQuestionario
              cliente={customToRender}
              motos={motosParaCuestionario}
              onComplete={handleQuestionnaireComplete}
              onSkip={handleQuestionnaireSkip}
              esConfirmacion={false}
              mode={questionnaireMode}
            />
          </div>
        </div>
      </div>
    );
  }

  // ✅ MOSTRAR CLIENTE NORMAL
  return (
    <div className="cliente-container">
      <NotificationModal
        isOpen={notif.open}
        type={notif.type}
        message={notif.message}
        onClose={() => setNotif((prev) => ({ ...prev, open: false }))}
      />
      <UleachCustomUser
        key={customToRender.id}
        Custom={customToRender}
        listBikes={listBikes}
        onOpenQuestionnaire={handleOpenQuestionnaire}
        questionnaireClienteFilled={
          !!(customToRender.peso && customToRender.nivelPilotaje)
        }
      />
    </div>
  );
}

export default Cliente;
