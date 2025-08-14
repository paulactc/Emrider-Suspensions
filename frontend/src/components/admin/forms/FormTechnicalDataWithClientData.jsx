// components/admin/forms/FormTechnicalDataWithClientData.jsx
import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import api from "../../../../services/Api";
import CuestionarioParaTecnico from "./CuestionarioParaTecnico";

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

  // ✅ Estado ampliado para TODOS los campos técnicos
  const [formDataLocal, setFormDataLocal] = useState({
    // Datos básicos del servicio
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

    // ✅ Campos técnicos específicos FF (Horquilla)
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
    compressionSettings: formData.compressionSettings || Array(20).fill(""),
    reboundSettings: formData.reboundSettings || Array(20).fill(""),

    // ✅ Campos técnicos específicos RR (Amortiguador)
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
    reboundOriginal: formData.reboundOriginal || Array(25).fill(""),
    reboundModification: formData.reboundModification || Array(25).fill(""),
    originalCompressionAdjuster:
      formData.originalCompressionAdjuster || Array(30).fill(""),
    modifiedCompressionAdjuster:
      formData.modifiedCompressionAdjuster || Array(30).fill(""),
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
  }, [motoId, clienteId]);

  useEffect(() => {
    if (formData && Object.keys(formData).length > 0) {
      setFormDataLocal((prev) => ({
        ...prev,
        ...formData,
      }));
    }
  }, [formData]);

  const cargarDatosClienteYMoto = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!motoId || motoId === "undefined" || motoId === "null") {
        throw new Error("ID de motocicleta no válido");
      }

      // Cargar datos de la moto
      const moto = await api.getMoto(motoId);
      console.log("🏍️ Moto obtenida:", moto);
      setMotoData(moto);

      // Cargar datos del cliente
      let cliente = null;
      if (clienteId) {
        cliente = await api.getCliente(clienteId);
      } else if (moto.cifPropietario) {
        const clientes = await api.getClientes();
        cliente = clientes.find((c) => c.cif === moto.cifPropietario);
      }

      if (cliente) {
        console.log("✅ Cliente encontrado:", cliente);
        setClienteData(cliente);

        const nuevosFormData = {
          ...formDataLocal,
          pesoPiloto: cliente.peso || formDataLocal.pesoPiloto,
          disciplina:
            obtenerDisciplinaFromMoto(moto) || formDataLocal.disciplina,
        };

        setFormDataLocal(nuevosFormData);
        verificarDatosCompletos(cliente, moto);
      } else {
        setDatosCompletos(true);
      }
    } catch (err) {
      console.error("❌ Error cargando datos:", err);
      setError(`Error al cargar los datos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

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
      alert("❌ Error al guardar los datos del cuestionario: " + error.message);
    }
  };

  // ✅ Función de validación
  const validateForm = () => {
    const newErrors = {};

    if (!formDataLocal.numeroOrden)
      newErrors.numeroOrden = "Número de orden requerido";
    if (!formDataLocal.servicioSuspension)
      newErrors.servicioSuspension = "Tipo de servicio requerido";
    if (!formDataLocal.marca) newErrors.marca = "Marca de suspensión requerida";
    if (!formDataLocal.modelo)
      newErrors.modelo = "Modelo de suspensión requerido";

    if (needsQuestionnaire) {
      if (!questionnaireData.peso) newErrors.peso = "Peso del piloto requerido";
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

  // ✅ Función para guardar datos técnicos
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const dataToSend = {
        motoId: parseInt(motoId),
        clienteId: clienteId ? parseInt(clienteId) : null,
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
          formDataLocal.originalCompressionAdjuster.filter((val) => val !== ""),
        modifiedCompressionAdjuster:
          formDataLocal.modifiedCompressionAdjuster.filter((val) => val !== ""),
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
          <h3>🔄 Cargando datos del cliente...</h3>
          <p>Obteniendo información del cuestionario previo</p>
        </div>
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
                <span className="info-label">Peso:</span>
                <span className="info-value">
                  {clienteData.peso ? (
                    `${clienteData.peso} kg`
                  ) : (
                    <span className="missing-data">⚠️ No disponible</span>
                  )}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Nivel de Pilotaje:</span>
                <span className="info-value">
                  {clienteData.nivelPilotaje ?? clienteData.nivel_pilotaje ? (
                    mapearNivelPilotaje(
                      clienteData.nivelPilotaje ?? clienteData.nivel_pilotaje
                    )
                  ) : (
                    <span className="missing-data">⚠️ No disponible</span>
                  )}
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
              <span>✅ Datos del cuestionario completos</span>
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

      {/* ✅ FORMULARIO TÉCNICO COMPLETO */}
      <form onSubmit={handleSubmit} className="technical-form">
        <div
          className={`formulario-principal ${
            !datosCompletos ? "deshabilitado" : ""
          }`}
        >
          {!datosCompletos && (
            <div className="overlay-deshabilitado">
              <AlertTriangle className="overlay-icon" />
              <p>Completa el cuestionario antes de continuar</p>
            </div>
          )}

          {/* ✅ INFORMACIÓN DEL SERVICIO */}
          <div className="form-section">
            <div className="section-header">
              <FileText size={24} />
              <h2>Información del Servicio</h2>
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
                  className={`form-input ${errors.numeroOrden ? "error" : ""}`}
                  placeholder="ORD-2025-001"
                  disabled={!datosCompletos}
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
                  disabled={!datosCompletos}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Kilómetros de la moto</label>
                <input
                  type="number"
                  value={formDataLocal.kmMoto}
                  onChange={(e) => handleInputChange("kmMoto", e.target.value)}
                  className="form-input"
                  placeholder="25000"
                  disabled={!datosCompletos}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Peso del Piloto (kg)</label>
                <input
                  type="number"
                  value={formDataLocal.pesoPiloto}
                  onChange={(e) =>
                    handleInputChange("pesoPiloto", e.target.value)
                  }
                  className="form-input"
                  placeholder="68"
                  min="40"
                  max="200"
                  disabled={!datosCompletos}
                />
                {!clienteData?.peso && (
                  <small className="field-note">
                    ⚠️ Este dato no está en el cuestionario del cliente.
                    Ingresado manualmente.
                  </small>
                )}
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
                  disabled={!datosCompletos}
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
            </div>
          </div>

          {/* ✅ DATOS DE SUSPENSIÓN */}
          <div className="form-section">
            <div className="section-header">
              <Settings size={24} />
              <h2>Datos de Suspensión</h2>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Marca *</label>
                <input
                  type="text"
                  value={formDataLocal.marca}
                  onChange={(e) => handleInputChange("marca", e.target.value)}
                  className={`form-input ${errors.marca ? "error" : ""}`}
                  placeholder="Öhlins"
                  disabled={!datosCompletos}
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
                  onChange={(e) => handleInputChange("modelo", e.target.value)}
                  className={`form-input ${errors.modelo ? "error" : ""}`}
                  placeholder={tipoSuspension === "FF" ? "NIX 30" : "TTX GP"}
                  disabled={!datosCompletos}
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
                  disabled={!datosCompletos}
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
                  disabled={!datosCompletos}
                />
              </div>
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
                      disabled={!datosCompletos}
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
                      disabled={!datosCompletos}
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
                      disabled={!datosCompletos}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Compresión</label>
                    <input
                      type="number"
                      value={formDataLocal.compressionDamping}
                      onChange={(e) =>
                        handleInputChange("compressionDamping", e.target.value)
                      }
                      className="form-input"
                      placeholder="12"
                      disabled={!datosCompletos}
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
                      disabled={!datosCompletos}
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
                      disabled={!datosCompletos}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">SAG (mm)</label>
                    <input
                      type="number"
                      value={formDataLocal.sag}
                      onChange={(e) => handleInputChange("sag", e.target.value)}
                      className="form-input"
                      placeholder="30"
                      disabled={!datosCompletos}
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
                      disabled={!datosCompletos}
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
                      disabled={!datosCompletos}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Capacidad Aceite (ml)</label>
                    <input
                      type="number"
                      value={formDataLocal.oilCapacity}
                      onChange={(e) =>
                        handleInputChange("oilCapacity", e.target.value)
                      }
                      className="form-input"
                      placeholder="450"
                      disabled={!datosCompletos}
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
                        disabled={!datosCompletos}
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
                        disabled={!datosCompletos}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ✅ CAMPOS TÉCNICOS ESPECÍFICOS RR */}
          {tipoSuspension === "RR" && (
            <>
              {/* Spring Data */}
              <div className="form-section">
                <div className="section-header">
                  <Zap size={24} />
                  <h2>Spring Data</h2>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Main Rate (N/mm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formDataLocal.mainRate}
                      onChange={(e) =>
                        handleInputChange("mainRate", e.target.value)
                      }
                      className="form-input"
                      placeholder="9.5"
                      disabled={!datosCompletos}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Spring Ref</label>
                    <input
                      type="text"
                      value={formDataLocal.springRef}
                      onChange={(e) =>
                        handleInputChange("springRef", e.target.value)
                      }
                      className="form-input"
                      placeholder="SPR-95-300"
                      disabled={!datosCompletos}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Length (mm)</label>
                    <input
                      type="number"
                      value={formDataLocal.length}
                      onChange={(e) =>
                        handleInputChange("length", e.target.value)
                      }
                      className="form-input"
                      placeholder="300"
                      disabled={!datosCompletos}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Número de espiras</label>
                    <input
                      type="number"
                      value={formDataLocal.numeroSpiras}
                      onChange={(e) =>
                        handleInputChange("numeroSpiras", e.target.value)
                      }
                      className="form-input"
                      placeholder="12"
                      disabled={!datosCompletos}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Outer Diameter (mm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formDataLocal.outerDiameter}
                      onChange={(e) =>
                        handleInputChange("outerDiameter", e.target.value)
                      }
                      className="form-input"
                      placeholder="46"
                      disabled={!datosCompletos}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Inner Diameter (mm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formDataLocal.innerDiameter}
                      onChange={(e) =>
                        handleInputChange("innerDiameter", e.target.value)
                      }
                      className="form-input"
                      placeholder="40"
                      disabled={!datosCompletos}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Stroke (mm)</label>
                    <input
                      type="number"
                      value={formDataLocal.stroke}
                      onChange={(e) =>
                        handleInputChange("stroke", e.target.value)
                      }
                      className="form-input"
                      placeholder="120"
                      disabled={!datosCompletos}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Shaft (mm)</label>
                    <input
                      type="number"
                      value={formDataLocal.shaft}
                      onChange={(e) =>
                        handleInputChange("shaft", e.target.value)
                      }
                      className="form-input"
                      placeholder="22"
                      disabled={!datosCompletos}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Piston (mm)</label>
                    <input
                      type="number"
                      value={formDataLocal.piston}
                      onChange={(e) =>
                        handleInputChange("piston", e.target.value)
                      }
                      className="form-input"
                      placeholder="46"
                      disabled={!datosCompletos}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Height (mm)</label>
                    <input
                      type="number"
                      value={formDataLocal.height}
                      onChange={(e) =>
                        handleInputChange("height", e.target.value)
                      }
                      className="form-input"
                      placeholder="580"
                      disabled={!datosCompletos}
                    />
                  </div>
                </div>
              </div>

              {/* Oil & Gas */}
              <div className="form-section">
                <div className="section-header">
                  <Gauge size={24} />
                  <h2>Oil & Gas</h2>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Oil</label>
                    <input
                      type="text"
                      value={formDataLocal.oil}
                      onChange={(e) => handleInputChange("oil", e.target.value)}
                      className="form-input"
                      placeholder="Fork Oil 7.5W"
                      disabled={!datosCompletos}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Gas</label>
                    <input
                      type="text"
                      value={formDataLocal.gas}
                      onChange={(e) => handleInputChange("gas", e.target.value)}
                      className="form-input"
                      placeholder="Nitrógeno 10 bar"
                      disabled={!datosCompletos}
                    />
                  </div>
                </div>
              </div>

              {/* Compresión */}
              <div className="form-section">
                <div className="section-header">
                  <Wrench size={24} />
                  <h2>Compresión</h2>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Compresión Original</label>
                    <input
                      type="number"
                      value={formDataLocal.compressionOriginal}
                      onChange={(e) =>
                        handleInputChange("compressionOriginal", e.target.value)
                      }
                      className="form-input"
                      placeholder="15"
                      disabled={!datosCompletos}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Compresión Modificada</label>
                    <input
                      type="number"
                      value={formDataLocal.compressionModification}
                      onChange={(e) =>
                        handleInputChange(
                          "compressionModification",
                          e.target.value
                        )
                      }
                      className="form-input"
                      placeholder="12"
                      disabled={!datosCompletos}
                    />
                  </div>
                </div>
              </div>

              {/* Ritorno Original */}
              <div className="form-section">
                <div className="section-header">
                  <Settings size={24} />
                  <h2>Ritorno (Return) - Original</h2>
                  <p>Valores de 1 a 25 posiciones</p>
                </div>

                <div className="array-grid">
                  {formDataLocal.reboundOriginal.map((value, index) => (
                    <div key={index} className="array-item">
                      <label className="array-label">{index + 1}</label>
                      <input
                        type="number"
                        value={value}
                        onChange={(e) =>
                          handleArrayChange(
                            "reboundOriginal",
                            index,
                            e.target.value
                          )
                        }
                        className="array-input"
                        placeholder="0"
                        disabled={!datosCompletos}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Ritorno Modificado */}
              <div className="form-section">
                <div className="section-header">
                  <Settings size={24} />
                  <h2>Ritorno (Return) - Modificado</h2>
                  <p>Valores de 1 a 25 posiciones</p>
                </div>

                <div className="array-grid">
                  {formDataLocal.reboundModification.map((value, index) => (
                    <div key={index} className="array-item">
                      <label className="array-label">{index + 1}</label>
                      <input
                        type="number"
                        value={value}
                        onChange={(e) =>
                          handleArrayChange(
                            "reboundModification",
                            index,
                            e.target.value
                          )
                        }
                        className="array-input"
                        placeholder="0"
                        disabled={!datosCompletos}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Ajustadores de Compresión Originales */}
              <div className="form-section">
                <div className="section-header">
                  <Gauge size={24} />
                  <h2>Ajustadores de Compresión - Originales</h2>
                  <p>Valores de 1 a 30 posiciones</p>
                </div>

                <div className="array-grid">
                  {formDataLocal.originalCompressionAdjuster.map(
                    (value, index) => (
                      <div key={index} className="array-item">
                        <label className="array-label">{index + 1}</label>
                        <input
                          type="number"
                          value={value}
                          onChange={(e) =>
                            handleArrayChange(
                              "originalCompressionAdjuster",
                              index,
                              e.target.value
                            )
                          }
                          className="array-input"
                          placeholder="0"
                          disabled={!datosCompletos}
                        />
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Ajustadores de Compresión Modificados */}
              <div className="form-section">
                <div className="section-header">
                  <Gauge size={24} />
                  <h2>Ajustadores de Compresión - Modificados</h2>
                  <p>Valores de 1 a 30 posiciones</p>
                </div>

                <div className="array-grid">
                  {formDataLocal.modifiedCompressionAdjuster.map(
                    (value, index) => (
                      <div key={index} className="array-item">
                        <label className="array-label">{index + 1}</label>
                        <input
                          type="number"
                          value={value}
                          onChange={(e) =>
                            handleArrayChange(
                              "modifiedCompressionAdjuster",
                              index,
                              e.target.value
                            )
                          }
                          className="array-input"
                          placeholder="0"
                          disabled={!datosCompletos}
                        />
                      </div>
                    )
                  )}
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
                disabled={!datosCompletos}
              />
            </div>
          </div>

          {/* ✅ BOTONES DE ACCIÓN */}
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
              disabled={saving || !datosCompletos}
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
                  Guardar Datos Técnicos {tipoSuspension}
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* ✅ ESTILOS CSS COMPLETOS */}
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
          border-radius: 16px 16px 0 0;
          margin-bottom: 0;
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
          background: white;
          border-radius: 0 0 16px 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          overflow: hidden;
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

        .status-complete {
          color: #10b981;
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
          background: rgba(17, 24, 39, 0.8);
          border-radius: 8px;
          padding: 1rem;
          margin-top: 1rem;
        }

        .status-complete {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #10b981;
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
          margin-top: 0.25rem;background: rgba(42, 48, 56, 0.5);
          font-style: italic;
        }

        .formulario-principal {
          position: relative;
          transition: all 0.3s ease;
          padding: 2rem;
          background: rgba(11, 11, 12, 0.5);
        }

        .formulario-principal.deshabilitado {
          opacity: 0.5;
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

        .overlay-icon {
          width: 3rem;
          height: 3rem;
          color: #f59e0b;
        }

        .overlay-deshabilitado p {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
        }


        }

        

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
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
          background: #f3f4f6;
          cursor: not-allowed;
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
          padding-top: 2rem;
          border-top: 2px solid #e5e7eb;
          margin-top: 2rem;
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
        }

        @media (max-width: 768px) {
          .app-containerform {
            padding: 1rem;
          }

          .form-header {
            padding: 1.5rem;
          }

          .formulario-principal {
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

          .suspension-type-badge {
            display: block;
            margin-left: 0;
            margin-top: 0.5rem;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}

export default FormTechnicalDataWithClientData;
