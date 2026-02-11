// components/admin/forms/FormTechnicalDataWithClientData.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router";
import {
  User,
  Bike,
  AlertTriangle,
  CheckCircle,
  Info,
  Wrench,
  Gauge,
  Settings,
  FileText,
  Zap,
  Calendar,
  Save,
  ArrowLeft,
  Lock,
  Unlock,
  Weight,
  Target,
} from "lucide-react";
import api from "../../../../services/Api";
import CuestionarioParaTecnico from "./CuestionarioParaTecnico";

// Componente para mostrar datos del cliente de forma compacta
const ClienteDataDisplay = ({ cliente }) => {
  console.log("🐛 ClienteDataDisplay - Props recibidas:", cliente);

  if (!cliente) {
    console.log("🐛 ClienteDataDisplay - Sin cliente, no se renderiza");
    return null;
  }

  const getSafeValue = (value, fallback = null) => {
    return value !== null && value !== undefined && value !== ""
      ? value
      : fallback;
  };

  const peso = getSafeValue(cliente.peso);
  const nivelPilotaje =
    getSafeValue(cliente.nivelPilotaje) || getSafeValue(cliente.nivel_pilotaje);

  console.log("🐛 ClienteDataDisplay - Valores extraídos:", {
    peso,
    nivelPilotaje,
  });

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

  const customerDataPilotaje = [];

  if (peso) {
    customerDataPilotaje.push({
      icon: Weight,
      label: "Peso",
      value: `Peso: ${peso} kg`,
    });
  }

  if (nivelPilotaje) {
    customerDataPilotaje.push({
      icon: Target,
      label: "Nivel",
      value: `Nivel: ${getNivelPilotajeLabel(nivelPilotaje)}`,
    });
  }

  console.log(
    "🐛 ClienteDataDisplay - Items a renderizar:",
    customerDataPilotaje
  );

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

const FormTechnicalDataWithClientData = React.memo(
  function FormTechnicalDataWithClientData({
    formData = {},
    handleChange,
    tipoSuspension = "FF", // ✅ Este prop determina qué campos técnicos mostrar
  }) {
    const { motoId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const qs = new URLSearchParams(location.search);
    const clienteId = qs.get("clienteId") ?? qs.get("clientId");

    const [clienteData, setClienteData] = useState(null);
    const [motoData, setMotoData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [datosCompletos, setDatosCompletos] = useState(false);
    const [mostrarCuestionario, setMostrarCuestionario] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [needsQuestionnaire, setNeedsQuestionnaire] = useState(false);

    // ✅ NUEVO: Estados para el flujo secuencial
    const [servicioGuardado, setServicioGuardado] = useState(false);
    const [guardandoServicio, setGuardandoServicio] = useState(false);
    const [servicioId, setServicioId] = useState(null); // Para guardar el ID del servicio existente

    // ✅ OPTIMIZADO: Estado inicial más ligero - arrays se crean solo cuando se necesiten
    const [formDataLocal, setFormDataLocal] = useState(() => {
      const baseData = {
        // Datos básicos del servicio (solo los esenciales inicialmente)
        pesoPiloto: formData.pesoPiloto || "",
        disciplina: formData.disciplina || "",
        numeroOrden: formData.numeroOrden || "",
        fechaServicio: new Date().toISOString().split("T")[0],
        kmMoto: formData.kmMoto || "",
        fechaProximoMantenimiento: formData.fechaProximoMantenimiento || "",
        servicioSuspension: formData.servicioSuspension || "",
        observaciones: formData.observaciones || "",

        // Datos de suspensión básicos
        marca: formData.marca || "",
        modelo: formData.modelo || "",
        año: formData.año || "",
        referenciasuspension: formData.referenciasuspension || "",
      };

      // Solo añadir campos técnicos si ya existen en formData (evita crear arrays grandes innecesariamente)
      if (Object.keys(formData).length > 0) {
        return {
          ...baseData,
          // Campos técnicos específicos FF (Horquilla)
          oilType: formData.oilType || "",
          oilLevel: formData.oilLevel || "",
          springRate: formData.springRate || "",
          compressionDamping: formData.compressionDamping || "",
          reboundDamping: formData.reboundDamping || "",
          preload: formData.preload || "",
          sag: formData.sag || "",
          forkLength: formData.forkLength || "",
          strokeLength: formData.strokeLength || "",
          oilCapacity: formData.oilCapacity || "",
          springLength: formData.springLength || "",
          compressionAdjuster: formData.compressionAdjuster || "",
          reboundAdjuster: formData.reboundAdjuster || "",
          compressionSettings: formData.compressionSettings || [],
          reboundSettings: formData.reboundSettings || [],

          // Campos técnicos específicos RR (Amortiguador)
          mainRate: formData.mainRate || "",
          springRef: formData.springRef || "",
          length: formData.length || "",
          numeroSpiras: formData.numeroSpiras || "",
          outerDiameter: formData.outerDiameter || "",
          innerDiameter: formData.innerDiameter || "",
          spire: formData.spire || "",
          rebSpring: formData.rebSpring || "",
          totalLength: formData.totalLength || "",
          stroke: formData.stroke || "",
          shaft: formData.shaft || "",
          piston: formData.piston || "",
          internalSpacer: formData.internalSpacer || "",
          height: formData.height || "",
          strokeToBumpRubber: formData.strokeToBumpRubber || "",
          rod: formData.rod || "",
          reboundSpring: formData.reboundSpring || "",
          springUpperDiameter: formData.springUpperDiameter || "",
          springLowerDiameter: formData.springLowerDiameter || "",
          headRodEnd: formData.headRodEnd || "",
          upperMount: formData.upperMount || "",
          lowerMount: formData.lowerMount || "",
          oil: formData.oil || "",
          gas: formData.gas || "",
          compressionOriginal: formData.compressionOriginal || "",
          compressionModification: formData.compressionModification || "",
          reboundOriginal: formData.reboundOriginal || [],
          reboundModification: formData.reboundModification || [],
          originalCompressionAdjuster:
            formData.originalCompressionAdjuster || [],
          modifiedCompressionAdjuster:
            formData.modifiedCompressionAdjuster || [],
        };
      }

      return baseData;
    });

    // Estado del cuestionario
    const [questionnaireData, setQuestionnaireData] = useState({
      peso: "",
      nivelPilotaje: "",
      especialidad: "",
      tipoConduccion: "",
      preferenciaRigidez: "",
    });

    useEffect(() => {
      console.log("🔍 Parámetros recibidos:", {
        motoId,
        clienteId,
        tipoSuspension,
      });
      if (!motoId) {
        setError("No se especificó el ID de la motocicleta");
        setLoading(false);
        return;
      }
      cargarDatosClienteYMoto();
    }, [motoId, clienteId]); // Solo depende de motoId y clienteId

    // ✅ OPTIMIZADO: Solo inicializa formData una vez al montar el componente
    useEffect(() => {
      if (formData && Object.keys(formData).length > 0) {
        console.log("🔄 Inicializando formData:", formData);
        setFormDataLocal((prev) => ({
          ...prev,
          ...formData,
        }));
      }
    }, []); // Array vacío para que solo se ejecute una vez

    const cargarDatosClienteYMoto = useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        if (!motoId || motoId === "undefined" || motoId === "null") {
          throw new Error("ID de motocicleta no válido");
        }

        // ✅ OPTIMIZADO: Cargar datos de la moto con timeout
        console.log("🏍️ Cargando moto ID:", motoId);
        const moto = await Promise.race([
          api.getMoto(motoId),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout al cargar moto")), 10000)
          ),
        ]);
        console.log("✅ Moto obtenida:", moto);
        setMotoData(moto);

        // ✅ NUEVO: Cargar servicio existente si ya existe
        let servicioExistente = null;
        try {
          console.log("🔍 Buscando servicio existente para moto:", motoId);
          const servicios = await api.getServiciosByMoto(motoId);
          if (servicios.success && servicios.data.length > 0) {
            // Tomar el servicio más reciente
            servicioExistente = servicios.data[0];
            console.log("✅ Servicio existente encontrado:", servicioExistente);

            // Pre-rellenar formulario con datos existentes
            setFormDataLocal((prev) => ({
              ...prev,
              numeroOrden: servicioExistente.numero_orden || prev.numeroOrden,
              fechaServicio: servicioExistente.fecha_servicio
                ? new Date(servicioExistente.fecha_servicio)
                    .toISOString()
                    .split("T")[0]
                : prev.fechaServicio,
              kmMoto: servicioExistente.km_moto || prev.kmMoto,
              fechaProximoMantenimiento:
                servicioExistente.fecha_proximo_mantenimiento
                  ? new Date(servicioExistente.fecha_proximo_mantenimiento)
                      .toISOString()
                      .split("T")[0]
                  : prev.fechaProximoMantenimiento,
              servicioSuspension:
                servicioExistente.servicio_suspension ||
                prev.servicioSuspension,
              observaciones:
                servicioExistente.observaciones || prev.observaciones,
              marca: servicioExistente.marca || prev.marca,
              modelo: servicioExistente.modelo || prev.modelo,
              año: servicioExistente.año || prev.año,
              referenciasuspension:
                servicioExistente.referencia || prev.referenciasuspension,
              pesoPiloto: servicioExistente.peso_piloto || prev.pesoPiloto,
              disciplina: servicioExistente.disciplina || prev.disciplina,
            }));

            // Marcar servicio como guardado si está completo y guardar su ID
            setServicioId(servicioExistente.id); // Guardar ID del servicio
            if (
              servicioExistente.status === "completed" ||
              servicioExistente.status === "pending"
            ) {
              setServicioGuardado(true);
              console.log(
                "✅ Servicio marcado como guardado:",
                servicioExistente.status
              );
            }
          } else {
            console.log("ℹ️ No se encontró servicio existente para esta moto");
          }
        } catch (servicioError) {
          console.warn(
            "⚠️ Error cargando servicio existente:",
            servicioError.message
          );
          // No bloquear el flujo si falla cargar el servicio
        }

        // ✅ OPTIMIZADO: Cargar datos del cliente de forma más eficiente
        let cliente = null;
        try {
          if (clienteId) {
            console.log("👤 Cargando cliente ID:", clienteId);
            cliente = await Promise.race([
              api.getCliente(clienteId),
              new Promise((_, reject) =>
                setTimeout(
                  () => reject(new Error("Timeout al cargar cliente")),
                  5000
                )
              ),
            ]);
          } else if (moto.cifPropietario) {
            console.log("👤 Buscando cliente por CIF:", moto.cifPropietario);
            const clientes = await Promise.race([
              api.getClientes(),
              new Promise((_, reject) =>
                setTimeout(
                  () => reject(new Error("Timeout al cargar clientes")),
                  5000
                )
              ),
            ]);
            cliente = clientes.find((c) => c.cif === moto.cifPropietario);
          }
        } catch (clienteError) {
          console.warn("⚠️ Error cargando cliente:", clienteError.message);
          // No bloqueamos el flujo si falla cargar cliente
        }

        if (cliente) {
          console.log("✅ Cliente encontrado:", cliente);
          setClienteData(cliente);

          // ✅ OPTIMIZADO: Actualizar solo los campos necesarios sin causar bucles
          setFormDataLocal((prev) => ({
            ...prev,
            pesoPiloto: cliente.peso || prev.pesoPiloto,
            disciplina: obtenerDisciplinaFromMoto(moto) || prev.disciplina,
          }));

          verificarDatosCompletos(cliente, moto);
        } else {
          console.log(
            "⚠️ Cliente no encontrado, continuando sin datos de cliente"
          );
          setDatosCompletos(false);
          setNeedsQuestionnaire(true);
          setMostrarCuestionario(true);
        }
      } catch (err) {
        console.error("❌ Error cargando datos:", err);
        setError(`Error al cargar los datos: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }, [motoId, clienteId]); // Dependencias del useCallback

    const obtenerDisciplinaFromMoto = (moto) => {
      if (!moto) return "";
      if (moto.especialidad === "onroad") return "Onroad";
      if (moto.especialidad === "offroad") return "Offroad";
      return "";
    };

    const verificarDatosCompletos = (cliente, moto) => {
      if (!cliente || !moto) return false;

      const cPeso = cliente?.peso;
      const cNivel = cliente?.nivelPilotaje ?? cliente?.nivel_pilotaje;
      const cTipo = cliente?.tipoConduccion ?? cliente?.tipo_conduccion;
      const cPref = cliente?.preferenciaRigidez ?? cliente?.preferencia_rigidez;
      const mEsp = moto?.especialidad;
      const mTipo = moto?.tipoConduccion ?? moto?.tipo_conduccion;
      const mPref = moto?.preferenciaRigidez ?? moto?.preferencia_rigidez;

      const tieneClienteData = Boolean(cPeso) && Boolean(cNivel);
      const tieneMotoData = Boolean(mEsp) && Boolean(mTipo) && Boolean(mPref);
      const completo = tieneClienteData && tieneMotoData;

      console.log("🔍 Verificación de datos completos:", {
        tieneClienteData,
        tieneMotoData,
        completo,
      });

      const needsQuest = !tieneClienteData || !tieneMotoData;
      setNeedsQuestionnaire(needsQuest);
      setDatosCompletos(Boolean(completo));
      if (!completo) setMostrarCuestionario(true);
      return completo;
    };

    // ✅ Función para manejar cambios en inputs normales
    const handleInputChange = (field, value) => {
      setFormDataLocal((prev) => ({
        ...prev,
        [field]: value,
      }));

      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: "",
        }));
      }

      if (handleChange && typeof handleChange === "function") {
        handleChange({
          target: { name: field, value: value },
        });
      }
    };

    // ✅ Función para manejar cambios en arrays
    const handleArrayChange = (field, index, value) => {
      setFormDataLocal((prev) => ({
        ...prev,
        [field]: prev[field].map((item, i) => (i === index ? value : item)),
      }));

      if (handleChange && typeof handleChange === "function") {
        const newArray = formDataLocal[field].map((item, i) =>
          i === index ? value : item
        );
        handleChange({
          target: { name: field, value: newArray },
        });
      }
    };

    const handleLocalChange = (e) => {
      const { name, value } = e.target;
      handleInputChange(name, value);
    };

    const handleQuestionnaireChange = (field, value) => {
      setQuestionnaireData((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

    const handleCuestionarioComplete = async (datosFormulario) => {
      try {
        console.log(
          "📝 Guardando datos del cuestionario desde técnico:",
          datosFormulario
        );

        // Simular guardado del cuestionario
        const result = await api.saveQuestionnaire(datosFormulario);

        if (result && result.success) {
          console.log("✅ Datos del cuestionario guardados correctamente");

          if (datosFormulario.cliente) {
            setClienteData((prev) => ({
              ...prev,
              peso: datosFormulario.cliente.peso,
              nivelPilotaje: datosFormulario.cliente.nivelPilotaje,
            }));
          }

          if (datosFormulario.motocicletas && datosFormulario.motocicletas[0]) {
            const motoActualizada = datosFormulario.motocicletas[0];
            setMotoData((prev) => ({
              ...prev,
              especialidad: motoActualizada.especialidad,
              tipoConduccion: motoActualizada.tipoConduccion,
              preferenciaRigidez: motoActualizada.preferenciaRigidez,
            }));
          }

          setMostrarCuestionario(false);
          setDatosCompletos(true);

          const nuevosFormData = {
            ...formDataLocal,
            pesoPiloto: datosFormulario.cliente.peso,
            disciplina:
              datosFormulario.motocicletas[0].especialidad === "onroad"
                ? "Onroad"
                : "Offroad",
          };

          setFormDataLocal(nuevosFormData);
          alert(
            "✅ Datos del cuestionario guardados correctamente. Ahora puedes continuar con el servicio técnico."
          );
        }
      } catch (error) {
        console.error("❌ Error guardando datos del cuestionario:", error);
        alert(
          "❌ Error al guardar los datos del cuestionario: " + error.message
        );
      }
    };

    // ✅ NUEVA: Función de validación para la información del servicio
    const validateServicioInfo = () => {
      const newErrors = {};

      if (!formDataLocal.numeroOrden)
        newErrors.numeroOrden = "Número de orden requerido";
      if (!formDataLocal.servicioSuspension)
        newErrors.servicioSuspension = "Tipo de servicio requerido";
      if (!formDataLocal.marca)
        newErrors.marca = "Marca de suspensión requerida";
      if (!formDataLocal.modelo)
        newErrors.modelo = "Modelo de suspensión requerido";

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    // ✅ NUEVA: Función para guardar solo la información del servicio
    const handleGuardarServicio = useCallback(async () => {
      if (!validateServicioInfo()) {
        return;
      }

      setGuardandoServicio(true);
      try {
        const servicioData = {
          motoId: motoId,
          clienteId: clienteId || null,
          tipoSuspension: tipoSuspension,
          numeroOrden: formDataLocal.numeroOrden,
          fechaServicio: formDataLocal.fechaServicio,
          kmMoto: formDataLocal.kmMoto,
          fechaProximoMantenimiento: formDataLocal.fechaProximoMantenimiento,
          servicioSuspension: formDataLocal.servicioSuspension,
          marca: formDataLocal.marca,
          modelo: formDataLocal.modelo,
          año: formDataLocal.año,
          referencia: formDataLocal.referenciasuspension,
          pesoPiloto: formDataLocal.pesoPiloto,
          disciplina: formDataLocal.disciplina,
        };

        console.log("Guardando información del servicio:", servicioData);

        // ✅ USAR API REAL - ACTUALIZAR SI EXISTE, CREAR SI ES NUEVO
        let result;
        if (servicioId) {
          console.log("📝 Actualizando servicio existente ID:", servicioId);
          result = await api.updateServicioInfo(servicioId, servicioData);
        } else {
          console.log("🆕 Creando nuevo servicio");
          result = await api.createServicioInfo(servicioData);
        }

        if (result && result.success) {
          setServicioGuardado(true);

          // Guardar el ID si es un servicio nuevo
          if (!servicioId && result.data && result.data.id) {
            setServicioId(result.data.id);
          }

          console.log("✅ Servicio guardado correctamente:", result.data);
          alert(
            "✅ Información del servicio guardada correctamente. Ahora puedes continuar con los datos técnicos."
          );
        } else {
          throw new Error(result?.message || "Error al guardar el servicio");
        }
      } catch (error) {
        console.error("Error guardando información del servicio:", error);
        setErrors({ general: "Error al guardar la información del servicio" });
      } finally {
        setGuardandoServicio(false);
      }
    }, [
      validateServicioInfo,
      formDataLocal,
      motoId,
      clienteId,
      tipoSuspension,
    ]); // Dependencias del useCallback

    // ✅ Función de validación completa
    const validateForm = () => {
      const newErrors = {};

      if (!servicioGuardado) {
        newErrors.general = "Primero debe guardar la información del servicio";
        setErrors(newErrors);
        return false;
      }

      if (needsQuestionnaire) {
        if (!questionnaireData.peso)
          newErrors.peso = "Peso del piloto requerido";
        if (!questionnaireData.nivelPilotaje)
          newErrors.nivelPilotaje = "Nivel de pilotaje requerido";
        if (!questionnaireData.especialidad)
          newErrors.especialidad = "Especialidad requerida";
        if (!questionnaireData.tipoConduccion)
          newErrors.tipoConduccion = "Tipo de conducción requerido";
        if (!questionnaireData.preferenciaRigidez)
          newErrors.preferenciaRigidez = "Preferencia de rigidez requerida";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    // ✅ Función para guardar datos técnicos completos
    const handleSubmit = async (e) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      setSaving(true);
      try {
        const dataToSend = {
          motoId: motoId,
          clienteId: clienteId || null,
          tipoSuspension: tipoSuspension,
          ...formDataLocal,
          // Filtrar arrays vacíos
          compressionSettings: formDataLocal.compressionSettings.filter(
            (val) => val !== ""
          ),
          reboundSettings: formDataLocal.reboundSettings.filter(
            (val) => val !== ""
          ),
          reboundOriginal: formDataLocal.reboundOriginal.filter(
            (val) => val !== ""
          ),
          reboundModification: formDataLocal.reboundModification.filter(
            (val) => val !== ""
          ),
          originalCompressionAdjuster:
            formDataLocal.originalCompressionAdjuster.filter(
              (val) => val !== ""
            ),
          modifiedCompressionAdjuster:
            formDataLocal.modifiedCompressionAdjuster.filter(
              (val) => val !== ""
            ),
        };

        if (needsQuestionnaire) {
          dataToSend.questionnaireData = questionnaireData;
        }

        console.log(`Datos técnicos ${tipoSuspension} a enviar:`, dataToSend);

        // Simular guardado
        await new Promise((resolve) => setTimeout(resolve, 1000));

        alert(`Datos técnicos ${tipoSuspension} guardados correctamente`);
        navigate(-1);
      } catch (error) {
        console.error("Error guardando datos técnicos:", error);
        setErrors({ general: "Error al guardar los datos técnicos" });
      } finally {
        setSaving(false);
      }
    };

    const mapearNivelPilotaje = (nivel) => {
      const niveles = {
        principiante: "Principiante",
        novato: "Novato",
        intermedio: "Intermedio",
        experto: "Experto",
        profesional: "Profesional",
      };
      return niveles[nivel] || nivel;
    };

    const mapearEspecialidad = (esp) => {
      return esp === "onroad" ? "Carretera" : esp === "offroad" ? "Campo" : esp;
    };

    if (loading) {
      return (
        <div className="app-containerform">
          <div className="loading-container">
            <div className="loading-spinner-simple"></div>
            <h3>Cargando datos técnicos...</h3>
            <p>Preparando formulario</p>
          </div>
          <style jsx>{`
            .loading-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 50vh;
              gap: 1rem;
            }
            .loading-spinner-simple {
              width: 40px;
              height: 40px;
              border: 4px solid #f3f4f6;
              border-top: 4px solid #3b82f6;
              border-radius: 50%;
              animation: spin 1s linear infinite;
            }
            @keyframes spin {
              0% {
                transform: rotate(0deg);
              }
              100% {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>
      );
    }

    if (error) {
      return (
        <div className="app-containerform">
          <div className="error-container">
            <h3>❌ Error al cargar datos</h3>
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-retry"
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="app-containerform">
        {/* Header con botón volver */}
        <div className="form-header">
          <button onClick={() => navigate(-1)} className="btn-back">
            <ArrowLeft size={20} />
            Volver
          </button>
          <div className="header-title">
            <h1>
              Datos Técnicos -{" "}
              {tipoSuspension === "FF"
                ? "FF (Horquilla Delantera)"
                : "RR (Amortiguador Trasero)"}
            </h1>
            {motoData && (
              <p>
                {motoData.marca} {motoData.modelo} - {motoData.matricula}
              </p>
            )}
          </div>
        </div>

        {errors.general && (
          <div className="error-banner">
            <AlertTriangle size={20} />
            {errors.general}
          </div>
        )}

        {/* Cuestionario para Técnico - Se muestra si faltan datos */}
        {mostrarCuestionario && (
          <CuestionarioParaTecnico
            cliente={clienteData}
            moto={motoData}
            onComplete={handleCuestionarioComplete}
            datosActuales={formDataLocal}
          />
        )}

        {/* Información del Cliente y Moto */}
        <div className="client-moto-info">
          <h2 className="header-title">
            Información del Cliente y Motocicleta
            <span className="suspension-type-badge">
              {tipoSuspension === "FF"
                ? "🔧 Horquilla Delantera (FF)"
                : "⚙️ Amortiguador Trasero (RR)"}
            </span>
          </h2>

          {/* Datos del Cliente */}
          <div className="info-section">
            <div className="info-header">
              <User className="info-icon" />
              <h3>Datos del Cliente</h3>
              {datosCompletos ? (
                <CheckCircle className="status-icon status-complete" />
              ) : (
                <AlertTriangle className="status-icon status-incomplete" />
              )}
            </div>

            {clienteData ? (
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Nombre:</span>
                  <span className="info-value">
                    {clienteData.nombre} {clienteData.apellidos}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">CIF:</span>
                  <span className="info-value">{clienteData.cif}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Datos de Pilotaje:</span>
                  <span className="info-value">
                    <ClienteDataDisplay cliente={clienteData} />
                  </span>
                </div>
              </div>
            ) : (
              <div className="no-data">
                <Info className="info-icon" />
                <span>No se encontraron datos del cliente</span>
              </div>
            )}
          </div>

          {/* Datos de la Moto */}
          <div className="info-section">
            <div className="info-header">
              <Bike className="info-icon" />
              <h3>Datos de la Motocicleta</h3>
            </div>

            {motoData ? (
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Marca/Modelo:</span>
                  <span className="info-value">
                    {motoData.marca} {motoData.modelo}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Año:</span>
                  <span className="info-value">{motoData.anio}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Matrícula:</span>
                  <span className="info-value">{motoData.matricula}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Especialidad:</span>
                  <span className="info-value">
                    {motoData.especialidad ? (
                      mapearEspecialidad(motoData.especialidad)
                    ) : (
                      <span className="missing-data">⚠️ No disponible</span>
                    )}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Tipo Conducción:</span>
                  <span className="info-value">
                    {(motoData.tipoConduccion ?? motoData.tipo_conduccion) || (
                      <span className="missing-data">⚠️ No disponible</span>
                    )}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Preferencia Rigidez:</span>
                  <span className="info-value">
                    {motoData.preferenciaRigidez || (
                      <span className="missing-data">⚠️ No disponible</span>
                    )}
                  </span>
                </div>
              </div>
            ) : (
              <div className="no-data">
                <Info className="info-icon" />
                <span>No se encontraron datos de la motocicleta</span>
              </div>
            )}
          </div>

          {/* Estado del Cuestionario */}
          <div className="questionnaire-status">
            {datosCompletos ? (
              <div className="status-complete">
                <CheckCircle className="status-icon" />
                <span> Datos del cuestionario completos</span>
                <button
                  onClick={() => setMostrarCuestionario(true)}
                  className="btn-modificar-datos"
                >
                  Modificar datos
                </button>
              </div>
            ) : (
              <div className="status-incomplete">
                <AlertTriangle className="status-icon" />
                <span>
                  ⚠️ Faltan datos del cuestionario.{" "}
                  {mostrarCuestionario
                    ? "Completa los campos arriba."
                    : "Usa el formulario de arriba para completarlos."}
                </span>
                {!mostrarCuestionario && (
                  <button
                    onClick={() => setMostrarCuestionario(true)}
                    className="btn-completar-datos"
                  >
                    Completar datos faltantes
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ✅ FORMULARIO TÉCNICO CON FLUJO SECUENCIAL */}
        <form onSubmit={handleSubmit} className="technical-form">
          {/* ✅ PASO 1: INFORMACIÓN DEL SERVICIO (Siempre visible si datos completos) */}
          <div
            className={`formulario-seccion ${
              !datosCompletos ? "deshabilitado" : ""
            } ${servicioGuardado ? "completado" : ""}`}
          >
            {!datosCompletos && (
              <div className="overlay-deshabilitado">
                <AlertTriangle className="overlay-icon" />
                <p>Completa el cuestionario antes de continuar</p>
              </div>
            )}

            {servicioGuardado && (
              <div className="overlay-completado">
                <CheckCircle className="overlay-icon" />
                <p>Información del servicio guardada correctamente</p>
                <button
                  type="button"
                  onClick={() => setServicioGuardado(false)}
                  className="btn-editar-servicio"
                >
                  Modificar información
                </button>
              </div>
            )}

            {/* ✅ INFORMACIÓN DEL SERVICIO */}
            <div className="form-section servicio-section">
              <div className="section-header">
                <FileText size={24} />
                <h2>Información del Servicio</h2>
                <div className="section-status">
                  {servicioGuardado ? (
                    <span className="status-saved">
                      <CheckCircle size={16} />
                      Guardado
                    </span>
                  ) : (
                    <span className="status-pending">
                      <AlertTriangle size={16} />
                      Pendiente
                    </span>
                  )}
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Número de orden *</label>
                  <input
                    type="text"
                    value={formDataLocal.numeroOrden}
                    onChange={(e) =>
                      handleInputChange("numeroOrden", e.target.value)
                    }
                    className={`form-input ${
                      errors.numeroOrden ? "error" : ""
                    }`}
                    placeholder="ORD-2025-001"
                    disabled={!datosCompletos || servicioGuardado}
                  />
                  {errors.numeroOrden && (
                    <span className="error-text">{errors.numeroOrden}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Fecha del servicio</label>
                  <input
                    type="date"
                    value={formDataLocal.fechaServicio}
                    onChange={(e) =>
                      handleInputChange("fechaServicio", e.target.value)
                    }
                    className="form-input"
                    disabled={!datosCompletos || servicioGuardado}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Kilómetros de la moto</label>
                  <input
                    type="number"
                    value={formDataLocal.kmMoto}
                    onChange={(e) =>
                      handleInputChange("kmMoto", e.target.value)
                    }
                    className="form-input"
                    placeholder="25000"
                    disabled={!datosCompletos || servicioGuardado}
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Tipo de servicio *</label>
                  <select
                    value={formDataLocal.servicioSuspension}
                    onChange={(e) =>
                      handleInputChange("servicioSuspension", e.target.value)
                    }
                    className={`form-input ${
                      errors.servicioSuspension ? "error" : ""
                    }`}
                    disabled={!datosCompletos || servicioGuardado}
                  >
                    <option value="">Seleccionar servicio</option>
                    <option value="mantenimiento-basico">
                      Mantenimiento básico
                    </option>
                    <option value="mantenimiento-basico-retener">
                      Mantenimiento básico + cambio de retener original
                    </option>
                    <option value="modificacion-hidraulico">
                      Modificación del hidráulico
                    </option>
                    <option value="mantenimiento-completo">
                      Mantenimiento completo
                    </option>
                  </select>
                  {errors.servicioSuspension && (
                    <span className="error-text">
                      {errors.servicioSuspension}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Marca *</label>
                  <input
                    type="text"
                    value={formDataLocal.marca}
                    onChange={(e) => handleInputChange("marca", e.target.value)}
                    className={`form-input ${errors.marca ? "error" : ""}`}
                    placeholder="Öhlins"
                    disabled={!datosCompletos || servicioGuardado}
                  />
                  {errors.marca && (
                    <span className="error-text">{errors.marca}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Modelo *</label>
                  <input
                    type="text"
                    value={formDataLocal.modelo}
                    onChange={(e) =>
                      handleInputChange("modelo", e.target.value)
                    }
                    className={`form-input ${errors.modelo ? "error" : ""}`}
                    placeholder={tipoSuspension === "FF" ? "NIX 30" : "TTX GP"}
                    disabled={!datosCompletos || servicioGuardado}
                  />
                  {errors.modelo && (
                    <span className="error-text">{errors.modelo}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Año</label>
                  <input
                    type="number"
                    value={formDataLocal.año}
                    onChange={(e) => handleInputChange("año", e.target.value)}
                    className="form-input"
                    placeholder="2021"
                    min="1990"
                    max={new Date().getFullYear()}
                    disabled={!datosCompletos || servicioGuardado}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Referencia</label>
                  <input
                    type="text"
                    value={formDataLocal.referenciasuspension}
                    onChange={(e) =>
                      handleInputChange("referenciasuspension", e.target.value)
                    }
                    className="form-input"
                    placeholder={
                      tipoSuspension === "FF" ? "NIX-30-43" : "TTX-GP-46-400"
                    }
                    disabled={!datosCompletos || servicioGuardado}
                  />
                </div>
              </div>

              {/* ✅ Botón para guardar solo la información del servicio */}
              {datosCompletos && !servicioGuardado && (
                <div className="section-actions">
                  <button
                    type="button"
                    onClick={handleGuardarServicio}
                    disabled={guardandoServicio}
                    className="btn-save-service"
                  >
                    {guardandoServicio ? (
                      <>
                        <div className="spinner"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save size={20} />
                        Guardar Información del Servicio
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ✅ RESTO DE SECCIONES (Solo visibles cuando el servicio esté guardado) */}
          <div
            className={`formulario-tecnico ${
              !servicioGuardado ? "deshabilitado" : ""
            }`}
          >
            {!servicioGuardado && (
              <div className="overlay-deshabilitado">
                <Lock className="overlay-icon" />
                <p>Guarda primero la información del servicio para continuar</p>
              </div>
            )}

            {/* ✅ DATOS DE SUSPENSIÓN */}
            <div className="form-section">
              <div className="section-header">
                <Settings size={24} />
                <h2>Datos de Suspensión</h2>
              </div>
            </div>

            {/* ✅ CAMPOS TÉCNICOS ESPECÍFICOS FF */}
            {tipoSuspension === "FF" && (
              <>
                <div className="form-section">
                  <div className="section-header">
                    <Wrench size={24} />
                    <h2>Datos Técnicos FF - Horquilla</h2>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Tipo de aceite</label>
                      <input
                        type="text"
                        value={formDataLocal.oilType}
                        onChange={(e) =>
                          handleInputChange("oilType", e.target.value)
                        }
                        className="form-input"
                        placeholder="Fork Oil 5W"
                        disabled={!servicioGuardado}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Nivel de aceite (mm)</label>
                      <input
                        type="number"
                        value={formDataLocal.oilLevel}
                        onChange={(e) =>
                          handleInputChange("oilLevel", e.target.value)
                        }
                        className="form-input"
                        placeholder="120"
                        disabled={!servicioGuardado}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Spring Rate (N/mm)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formDataLocal.springRate}
                        onChange={(e) =>
                          handleInputChange("springRate", e.target.value)
                        }
                        className="form-input"
                        placeholder="7.5"
                        disabled={!servicioGuardado}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Compresión</label>
                      <input
                        type="number"
                        value={formDataLocal.compressionDamping}
                        onChange={(e) =>
                          handleInputChange(
                            "compressionDamping",
                            e.target.value
                          )
                        }
                        className="form-input"
                        placeholder="12"
                        disabled={!servicioGuardado}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Rebote</label>
                      <input
                        type="number"
                        value={formDataLocal.reboundDamping}
                        onChange={(e) =>
                          handleInputChange("reboundDamping", e.target.value)
                        }
                        className="form-input"
                        placeholder="14"
                        disabled={!servicioGuardado}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Precarga (mm)</label>
                      <input
                        type="number"
                        value={formDataLocal.preload}
                        onChange={(e) =>
                          handleInputChange("preload", e.target.value)
                        }
                        className="form-input"
                        placeholder="5"
                        disabled={!servicioGuardado}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">SAG (mm)</label>
                      <input
                        type="number"
                        value={formDataLocal.sag}
                        onChange={(e) =>
                          handleInputChange("sag", e.target.value)
                        }
                        className="form-input"
                        placeholder="30"
                        disabled={!servicioGuardado}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Longitud Horquilla (mm)
                      </label>
                      <input
                        type="number"
                        value={formDataLocal.forkLength}
                        onChange={(e) =>
                          handleInputChange("forkLength", e.target.value)
                        }
                        className="form-input"
                        placeholder="650"
                        disabled={!servicioGuardado}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Recorrido (mm)</label>
                      <input
                        type="number"
                        value={formDataLocal.strokeLength}
                        onChange={(e) =>
                          handleInputChange("strokeLength", e.target.value)
                        }
                        className="form-input"
                        placeholder="120"
                        disabled={!servicioGuardado}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Capacidad Aceite (ml)
                      </label>
                      <input
                        type="number"
                        value={formDataLocal.oilCapacity}
                        onChange={(e) =>
                          handleInputChange("oilCapacity", e.target.value)
                        }
                        className="form-input"
                        placeholder="450"
                        disabled={!servicioGuardado}
                      />
                    </div>
                  </div>
                </div>

                {/* Ajustadores de Compresión FF */}
                <div className="form-section">
                  <div className="section-header">
                    <Gauge size={24} />
                    <h2>Ajustadores de Compresión FF</h2>
                    <p>Valores de 1 a 20 posiciones (horquilla)</p>
                  </div>

                  <div className="array-grid">
                    {formDataLocal.compressionSettings.map((value, index) => (
                      <div key={index} className="array-item">
                        <label className="array-label">{index + 1}</label>
                        <input
                          type="number"
                          value={value}
                          onChange={(e) =>
                            handleArrayChange(
                              "compressionSettings",
                              index,
                              e.target.value
                            )
                          }
                          className="array-input"
                          placeholder="0"
                          disabled={!servicioGuardado}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ajustadores de Rebote FF */}
                <div className="form-section">
                  <div className="section-header">
                    <Settings size={24} />
                    <h2>Ajustadores de Rebote FF</h2>
                    <p>Valores de 1 a 20 posiciones (horquilla)</p>
                  </div>

                  <div className="array-grid">
                    {formDataLocal.reboundSettings.map((value, index) => (
                      <div key={index} className="array-item">
                        <label className="array-label">{index + 1}</label>
                        <input
                          type="number"
                          value={value}
                          onChange={(e) =>
                            handleArrayChange(
                              "reboundSettings",
                              index,
                              e.target.value
                            )
                          }
                          className="array-input"
                          placeholder="0"
                          disabled={!servicioGuardado}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ✅ OBSERVACIONES */}
            <div className="form-section">
              <div className="section-header">
                <FileText size={24} />
                <h2>Observaciones</h2>
              </div>

              <div className="form-group full-width">
                <label className="form-label">Observaciones del servicio</label>
                <textarea
                  value={formDataLocal.observaciones}
                  onChange={(e) =>
                    handleInputChange("observaciones", e.target.value)
                  }
                  className="form-textarea"
                  rows="6"
                  placeholder="Describa cualquier observación importante sobre el servicio realizado..."
                  disabled={!servicioGuardado}
                />
              </div>
            </div>

            {/* ✅ BOTONES DE ACCIÓN FINALES */}
            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-cancel"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving || !servicioGuardado}
                className="btn-save"
              >
                {saving ? (
                  <>
                    <div className="spinner"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Finalizar y Guardar Datos Técnicos {tipoSuspension}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* ✅ ESTILOS CSS COMPLETOS CON FLUJO SECUENCIAL */}
        <style>{`
        .app-containerform {
          min-height: 100vh;
          background: linear-gradient(135deg, #0c0c0cff 0%, #686067ff 100%);
          padding: 2rem;
        }

        .form-header {
          background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
          color: white;
          padding: 2rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          
          
        }

        .btn-back {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 0.75rem;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }

        .btn-back:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .header-title h1 {
          margin: 0 0 0.5rem 0;
          font-size: 1.75rem;
          font-weight: 700;
        }

        .header-title p {
          margin: 0;
          opacity: 0.8;
          font-size: 1rem;
        }

        .error-banner {
          background: #fee2e2;
          border-left: 4px solid #ef4444;
          color: #991b1b;
          padding: 1rem 2rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2rem;
        }

        .technical-form {
          background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
          border: 1px solid #374151;
        }

        .client-moto-info {
          background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
          border: 1px solid #374151;
        }

        .info-section {
          background: rgba(55, 65, 81, 0.5);
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .info-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #4b5563;
        }

        .info-header h3 {
          color: #f9fafb;
          margin: 0;
          flex: 1;
        }

        .info-icon {
          color: #fbbf24;
          width: 1.25rem;
          height: 1.25rem;
        }

        .status-icon {
          width: 1.25rem;
          height: 1.25rem;
        }

        

        .status-incomplete {
          color: #f59e0b;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .info-label {
          color: #9ca3af;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .info-value {
          color: #f9fafb;
          font-weight: 600;
        }

        .missing-data {
          color: #f59e0b;
          font-style: italic;
        }

        .no-data {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #9ca3af;
          font-style: italic;
        }

        .questionnaire-status {
          background: rgba(16, 185, 129, 0.95);
          border-radius: 8px;
          padding: 1rem;
          margin-top: 1rem;
        
        }

        .status-complete {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #f2f5f4ff;
        }

        .status-incomplete {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #f59e0b;
        }

        .field-note {
          display: block;
          color: #f59e0b;
          font-size: 0.8rem;
          margin-top: 0.25rem;
          font-style: italic;
        }

        /* ✅ ESTILOS PARA FLUJO SECUENCIAL */
        .formulario-seccion {
          position: relative;
          transition: all 0.3s ease;
         
          background:#2A2A2A;

        }

        .formulario-seccion.deshabilitado {
          opacity: 0.5;
          pointer-events: none;
        }

        .formulario-seccion.completado .servicio-section {
          background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
    border-radius: 12px;
    padding: 2rem;
     border: 1px solid #374151;
        }

        .formulario-tecnico {
          position: relative;
          transition: all 0.3s ease;
        }

        .formulario-tecnico.deshabilitado {
          opacity: 0.3;
          pointer-events: none;
        }

        .overlay-deshabilitado {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 10;
          border-radius: 12px;
          color: #f59e0b;
          text-align: center;
          gap: 1rem;
        }

        .overlay-completado {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(16, 185, 129, 0.95);
          color: white;
          padding: 1rem;
          border-radius: 8px;
          z-index: 5;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          text-align: center;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .overlay-icon {
          width: 3rem;
          height: 3rem;
          color: #ffffffff;
        }

        .overlay-completado .overlay-icon {
          width: 1.5rem;
          height: 1.5rem;
          color: white;
        }

        .overlay-deshabilitado p,
        .overlay-completado p {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
        }

        .overlay-completado p {
          font-size: 0.875rem;
        }

        .btn-editar-servicio {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-editar-servicio:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .form-section {
          background: #f9fafb;
          border-radius: 12px;
          padding: 2rem;
         
          border: 1px solid #e5e7eb;
          position: relative;
        }

        .servicio-section {
          background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
          border: 1px solid #374151;
          color: white;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #e5e7eb;
        }

        /* ✅ Estilos específicos para sección de servicio */
        .servicio-section .section-header {
          border-bottom: 2px solid #4b5563;
        }

        .section-header svg {
          color: #3b82f6;
          flex-shrink: 0;
        }

        /* ✅ Estilos específicos para sección de servicio */
        .servicio-section .section-header svg {
          color: #fbbf24;
        }

        .section-header h2 {
          margin: 0;
          color: #1f2937;
          font-size: 1.5rem;
          font-weight: 600;
          flex: 1;
        }

        /* ✅ Estilos específicos para sección de servicio */
        .servicio-section .section-header h2 {
          color: #f9fafb;
        }

        .section-header p {
          margin: 0;
          color: #6b7280;
          font-size: 0.875rem;
        }

        /* ✅ Estilos específicos para sección de servicio */
        .servicio-section .section-header p {
          color: #9ca3af;
        }

        .section-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .status-saved {
          color: #10b981;
        }

        .status-pending {
          color: #f59e0b;
        }

        /* ✅ Estilos específicos para section-status en sección de servicio */
        .servicio-section .status-saved {
          color: #34d399;
        }

        .servicio-section .status-pending {
          color: #fbbf24;
        }

        .section-actions {
          display: flex;
          justify-content: center;
          padding-top: 2rem;
          border-top: 2px solid #e5e7eb;
          margin-top: 2rem;
        }

        .btn-save-service {
          background: #10b981;1
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          transition: all 0.2s;
        }

        .btn-save-service:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(249, 115, 22, 0.3);
        }

        .btn-save-service:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        /* ✅ Estilos específicos para form-grid en sección de servicio */
        .servicio-section .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.25rem;
          background: rgba(55, 65, 81, 0.3);
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-label {
          font-weight: 600;
          color: #374151;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* ✅ Estilos específicos para labels en sección de servicio */
        .servicio-section .form-label {
          color: #f9fafb;
          font-weight: 600;
        }

        .form-input {
          padding: 0.75rem 1rem;
          border: 2px solid #d1d5db;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s;
          background:#2A2A2A;
        }

        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-input.error {
          border-color: #ef4444;
          background-color: #fef2f2;
        }

        .form-input:disabled {
          background: #2A2A2A;
    border-radius: 0.5rem;
    border: 1px solid #4A4A4A;
    transition: all 0.3s ease-in-out;
        }

        .form-textarea {
          padding: 0.75rem 1rem;
          border: 2px solid #d1d5db;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s;
          background: white;
          resize: vertical;
          min-height: 120px;
          font-family: inherit;
        }

        .form-textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-textarea:disabled {
          background: #f3f4f6;
          cursor: not-allowed;
        }

        .error-text {
          color: #ef4444;
          font-size: 0.875rem;
          font-weight: 500;
        }

        /* ✅ Estilos específicos para error-text en sección de servicio */
        .servicio-section .error-text {
          color: #fca5a5;
          font-weight: 600;
        }

        /* ✅ ESTILOS PARA ARRAYS */
        .array-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          gap: 0.75rem;
          max-height: 400px;
          overflow-y: auto;
          padding: 1rem;
          background: white;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .array-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .array-label {
          font-size: 0.6875rem;
          font-weight: 600;
          color: #6b7280;
          text-align: center;
          line-height: 1;
        }

        .array-input {
          width: 100%;
          padding: 0.375rem 0.25rem;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          text-align: center;
          font-size: 0.75rem;
          transition: all 0.2s;
        }

        .array-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .array-input:disabled {
          background: #f3f4f6;
          cursor: not-allowed;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding: 2rem;
          border-top: 2px solid #e5e7eb;
          margin-top: 2rem;
          background: #f9fafb;
        }

        .btn-cancel {
          padding: 0.75rem 1.5rem;
          background: #6b7280;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-cancel:hover {
          background: #4b5563;
        }

        .btn-save {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-save:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }

        .btn-save:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          width: 1rem;
          height: 1rem;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .btn-modificar-datos,
        .btn-completar-datos {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          margin-left: 1rem;
        }

        .btn-modificar-datos:hover,
        .btn-completar-datos:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .btn-completar-datos {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }

        .btn-completar-datos:hover {
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
        }

        .btn-retry {
          background: #ef4444;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          margin-top: 1rem;
          transition: all 0.2s;
        }

        .btn-retry:hover {
          background: #dc2626;
        }

        .loading-container,
        .error-container {
          background: rgba(31, 41, 55, 0.9);
          border-radius: 12px;
          padding: 3rem;
          text-align: center;
          color: #f9fafb;
        }

        .error-container {
          border: 1px solid #ef4444;
        }

        .suspension-type-badge {
          display: inline-block;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
          margin-left: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          margin-bottom: 0.8rem;
        }

        /* ✅ ESTILOS PARA ClienteDataDisplay */
        .uleach-customer-compact__info {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          align-items: center;
        }

        .uleach-customer-compact__info .info-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(16, 185, 129, 0.1);
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          border: 1px solid #f7faf9ff;
        }

        .uleach-customer-compact__info .info-icon {
          color: #d8ce3dff;
          width: 1rem;
          height: 1rem;
        }

        .uleach-customer-compact__info .info-text {
          color: #f9fafb;
          font-size: 0.875rem;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .app-containerform {
            padding: 1rem;
          }

          .form-header {
            padding: 1.5rem;
          }

          .form-section {
            padding: 1.5rem;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .array-grid {
            grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
          }

          .form-actions {
            flex-direction: column;
          }

          

          .overlay-completado {
            position: relative;
            top: auto;
            right: auto;
            margin-bottom: 1rem;
          }
        }
      `}</style>
      </div>
    );
  }
);

export default FormTechnicalDataWithClientData;
