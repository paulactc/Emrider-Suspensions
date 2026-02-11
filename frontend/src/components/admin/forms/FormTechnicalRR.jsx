import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import {
  Save,
  ArrowLeft,
  AlertCircle,
  User,
  Bike,
  Settings,
  FileText,
  Calendar,
  Wrench,
  Gauge,
  Zap,
} from "lucide-react";
import api from "../../../../services/Api";

const FormTechnicalRR = () => {
  const { motoId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const clienteId = new URLSearchParams(location.search).get("clienteId");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [motoData, setMotoData] = useState(null);
  const [clienteData, setClienteData] = useState(null);
  const [needsQuestionnaire, setNeedsQuestionnaire] = useState(false);

  // Estado del formulario - Datos del cliente (cuestionario)
  const [questionnaireData, setQuestionnaireData] = useState({
    peso: "",
    nivelPilotaje: "",
    especialidad: "",
    tipoConduccion: "",
    preferenciaRigidez: "",
  });

  // Estado del formulario - Datos técnicos RR
  const [formData, setFormData] = useState({
    // Información del servicio
    numeroOrden: "",
    fechaServicio: new Date().toISOString().split("T")[0],
    kmMoto: "",
    fechaProximoMantenimiento: "",
    servicioSuspension: "",
    observaciones: "",

    // Datos de suspensión
    marca: "",
    modelo: "",
    año: "",
    referencia: "",

    // Datos técnicos específicos RR
    mainRate: "",
    springRef: "",
    length: "",
    numeroSpiras: "",
    outerDiameter: "",
    innerDiameter: "",
    spire: "",
    rebSpring: "",
    totalLength: "",
    stroke: "",
    shaft: "",
    piston: "",
    internalSpacer: "",
    height: "",
    strokeToBumpRubber: "",
    rod: "",
    reboundSpring: "",
    springLength: "",
    springUpperDiameter: "",
    springLowerDiameter: "",
    headRodEnd: "",
    upperMount: "",
    lowerMount: "",

    // Aceite y gas
    oil: "",
    gas: "",

    // Compresión
    compressionOriginal: "",
    compressionModification: "",

    // Ritorno (arrays de valores)
    reboundOriginal: Array(25).fill(""), // Hasta 25 posiciones como en el PDF
    reboundModification: Array(25).fill(""),

    // Ajustadores de compresión
    originalCompressionAdjuster: Array(30).fill(""), // Hasta 30 posiciones
    modifiedCompressionAdjuster: Array(30).fill(""),
  });

  useEffect(() => {
    console.log("🔍 FormTechnicalRR - Parámetros:", { motoId, clienteId });
    loadInitialData();
  }, [motoId, clienteId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      console.log("🔍 Iniciando carga de datos RR...");
      console.log("📊 motoId:", motoId, "clienteId:", clienteId);

      // Cargar datos REALES de la moto
      if (motoId) {
        console.log("🏍️ Cargando datos de la moto...");
        const moto = await api.getMoto(motoId);
        console.log("✅ Moto cargada:", moto);
        setMotoData(moto);
      }

      // Cargar datos del cliente
      if (clienteId) {
        console.log("👤 Cargando datos del cliente...");
        const cliente = await api.getCliente(clienteId);
        console.log("✅ Cliente cargado:", cliente);
        console.log("📋 Datos del cuestionario:", {
          peso: cliente.peso,
          nivelPilotaje: cliente.nivel_pilotaje || cliente.nivelPilotaje,
          especialidad: cliente.especialidad,
          tipoConduccion: cliente.tipo_conduccion || cliente.tipoConduccion,
          preferenciaRigidez:
            cliente.preferencia_rigidez || cliente.preferenciaRigidez,
        });

        setClienteData(cliente);

        // Verificar si necesita completar cuestionario (considerando snake_case y camelCase)
        const peso = cliente.peso;
        const nivelPilotaje = cliente.nivel_pilotaje || cliente.nivelPilotaje;
        const especialidad = cliente.especialidad;
        const tipoConduccion =
          cliente.tipo_conduccion || cliente.tipoConduccion;
        const preferenciaRigidez =
          cliente.preferencia_rigidez || cliente.preferenciaRigidez;

        const needsQuest =
          !peso ||
          !nivelPilotaje ||
          !especialidad ||
          !tipoConduccion ||
          !preferenciaRigidez;

        console.log("🔍 ¿Necesita cuestionario?", needsQuest);
        console.log("📊 Campos faltantes:", {
          peso: !peso,
          nivelPilotaje: !nivelPilotaje,
          especialidad: !especialidad,
          tipoConduccion: !tipoConduccion,
          preferenciaRigidez: !preferenciaRigidez,
        });

        setNeedsQuestionnaire(needsQuest);

        // Si NO necesita cuestionario, pre-cargar los datos
        if (!needsQuest) {
          console.log("✅ Pre-cargando datos del cuestionario existente");
          setQuestionnaireData({
            peso: peso || "",
            nivelPilotaje: nivelPilotaje || "",
            especialidad: especialidad || "",
            tipoConduccion: tipoConduccion || "",
            preferenciaRigidez: preferenciaRigidez || "",
          });
        } else {
          console.log("⚠️ Cliente necesita completar cuestionario");
        }
      } else {
        console.log("⚠️ No hay clienteId proporcionado");
      }
    } catch (error) {
      console.error("❌ Error cargando datos:", error);
      setErrors({ general: "Error al cargar los datos iniciales" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Limpiar error si existe
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleQuestionnaireChange = (field, value) => {
    setQuestionnaireData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayChange = (field, index, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Validaciones básicas
    if (!formData.numeroOrden)
      newErrors.numeroOrden = "Número de orden requerido";
    if (!formData.servicioSuspension)
      newErrors.servicioSuspension = "Tipo de servicio requerido";
    if (!formData.marca) newErrors.marca = "Marca de suspensión requerida";
    if (!formData.modelo) newErrors.modelo = "Modelo de suspensión requerido";

    // Validaciones de cuestionario si es necesario
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      // Preparar datos para enviar
      const dataToSend = {
        motoId: motoId,
        clienteId: clienteId || null,
        tipoSuspension: "RR",
        ...formData,
        // Filtrar arrays vacíos
        reboundOriginal: formData.reboundOriginal.filter((val) => val !== ""),
        reboundModification: formData.reboundModification.filter(
          (val) => val !== ""
        ),
        originalCompressionAdjuster:
          formData.originalCompressionAdjuster.filter((val) => val !== ""),
        modifiedCompressionAdjuster:
          formData.modifiedCompressionAdjuster.filter((val) => val !== ""),
      };

      // Si necesita cuestionario, incluir esos datos
      if (needsQuestionnaire) {
        dataToSend.questionnaireData = questionnaireData;
      }

      console.log("Datos RR a enviar:", dataToSend);

      // Simular guardado
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert("Datos técnicos RR guardados correctamente");
      navigate(-1);
    } catch (error) {
      console.error("Error guardando datos técnicos:", error);
      setErrors({ general: "Error al guardar los datos técnicos" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando formulario RR...</p>
      </div>
    );
  }

  return (
    <div className="app-containerform">
      <div className="form-technical-rr">
        {/* Header */}
        <div className="form-header">
          <button onClick={() => navigate(-1)} className="btn-back">
            <ArrowLeft size={20} />
            Volver
          </button>
          <div className="header-title">
            <h1>Datos Técnicos - RR (Amortiguador Trasero)</h1>
            {motoData && (
              <p>
                {motoData.marca} {motoData.modelo} - {motoData.matricula}
              </p>
            )}
          </div>
        </div>

        {errors.general && (
          <div className="error-banner">
            <AlertCircle size={20} />
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="technical-form">
          {/* Cuestionario del cliente si es necesario */}
          {needsQuestionnaire && (
            <div className="form-section questionnaire-section">
              <div className="section-header">
                <User size={24} />
                <h2>Datos del Cliente</h2>
                <p>Complete los datos del cuestionario del cliente</p>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Peso del piloto (kg) *</label>
                  <input
                    type="number"
                    value={questionnaireData.peso}
                    onChange={(e) =>
                      handleQuestionnaireChange("peso", e.target.value)
                    }
                    className={`form-input ${errors.peso ? "error" : ""}`}
                    placeholder="75"
                    min="40"
                    max="200"
                  />
                  {errors.peso && (
                    <span className="error-text">{errors.peso}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Nivel de pilotaje *</label>
                  <select
                    value={questionnaireData.nivelPilotaje}
                    onChange={(e) =>
                      handleQuestionnaireChange("nivelPilotaje", e.target.value)
                    }
                    className={`form-input ${
                      errors.nivelPilotaje ? "error" : ""
                    }`}
                  >
                    <option value="">Seleccionar nivel</option>
                    <option value="principiante">Principiante</option>
                    <option value="novato">Novato</option>
                    <option value="intermedio">Intermedio</option>
                    <option value="experto">Experto</option>
                    <option value="profesional">Profesional</option>
                  </select>
                  {errors.nivelPilotaje && (
                    <span className="error-text">{errors.nivelPilotaje}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Especialidad *</label>
                  <select
                    value={questionnaireData.especialidad}
                    onChange={(e) =>
                      handleQuestionnaireChange("especialidad", e.target.value)
                    }
                    className={`form-input ${
                      errors.especialidad ? "error" : ""
                    }`}
                  >
                    <option value="">Seleccionar especialidad</option>
                    <option value="onroad">On Road</option>
                    <option value="offroad">Off Road</option>
                  </select>
                  {errors.especialidad && (
                    <span className="error-text">{errors.especialidad}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Tipo de conducción *</label>
                  <select
                    value={questionnaireData.tipoConduccion}
                    onChange={(e) =>
                      handleQuestionnaireChange(
                        "tipoConduccion",
                        e.target.value
                      )
                    }
                    className={`form-input ${
                      errors.tipoConduccion ? "error" : ""
                    }`}
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="calle">Calle</option>
                    <option value="circuito-asfalto">Circuito Asfalto</option>
                    <option value="circuito-tierra">Circuito Tierra</option>
                  </select>
                  {errors.tipoConduccion && (
                    <span className="error-text">{errors.tipoConduccion}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Preferencia de rigidez *</label>
                  <select
                    value={questionnaireData.preferenciaRigidez}
                    onChange={(e) =>
                      handleQuestionnaireChange(
                        "preferenciaRigidez",
                        e.target.value
                      )
                    }
                    className={`form-input ${
                      errors.preferenciaRigidez ? "error" : ""
                    }`}
                  >
                    <option value="">Seleccionar preferencia</option>
                    <option value="blando">Más Blando</option>
                    <option value="duro">Más Duro</option>
                  </select>
                  {errors.preferenciaRigidez && (
                    <span className="error-text">
                      {errors.preferenciaRigidez}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Información del servicio */}
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
                  value={formData.numeroOrden}
                  onChange={(e) =>
                    handleInputChange("numeroOrden", e.target.value)
                  }
                  className={`form-input ${errors.numeroOrden ? "error" : ""}`}
                  placeholder="ORD-2025-001"
                />
                {errors.numeroOrden && (
                  <span className="error-text">{errors.numeroOrden}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Fecha del servicio</label>
                <input
                  type="date"
                  value={formData.fechaServicio}
                  onChange={(e) =>
                    handleInputChange("fechaServicio", e.target.value)
                  }
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Kilómetros de la moto</label>
                <input
                  type="number"
                  value={formData.kmMoto}
                  onChange={(e) => handleInputChange("kmMoto", e.target.value)}
                  className="form-input"
                  placeholder="25000"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Fecha próximo mantenimiento
                </label>
                <input
                  type="date"
                  value={formData.fechaProximoMantenimiento}
                  onChange={(e) =>
                    handleInputChange(
                      "fechaProximoMantenimiento",
                      e.target.value
                    )
                  }
                  className="form-input"
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">Tipo de servicio *</label>
                <select
                  value={formData.servicioSuspension}
                  onChange={(e) =>
                    handleInputChange("servicioSuspension", e.target.value)
                  }
                  className={`form-input ${
                    errors.servicioSuspension ? "error" : ""
                  }`}
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

          {/* Datos de suspensión */}
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
                  value={formData.marca}
                  onChange={(e) => handleInputChange("marca", e.target.value)}
                  className={`form-input ${errors.marca ? "error" : ""}`}
                  placeholder="Öhlins"
                />
                {errors.marca && (
                  <span className="error-text">{errors.marca}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Modelo *</label>
                <input
                  type="text"
                  value={formData.modelo}
                  onChange={(e) => handleInputChange("modelo", e.target.value)}
                  className={`form-input ${errors.modelo ? "error" : ""}`}
                  placeholder="TTX GP"
                />
                {errors.modelo && (
                  <span className="error-text">{errors.modelo}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Año</label>
                <input
                  type="number"
                  value={formData.año}
                  onChange={(e) => handleInputChange("año", e.target.value)}
                  className="form-input"
                  placeholder="2021"
                  min="1990"
                  max={new Date().getFullYear()}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Referencia</label>
                <input
                  type="text"
                  value={formData.referencia}
                  onChange={(e) =>
                    handleInputChange("referencia", e.target.value)
                  }
                  className="form-input"
                  placeholder="TTX-GP-46-400"
                />
              </div>
            </div>
          </div>

          {/* Datos técnicos específicos RR - Spring Data */}
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
                  value={formData.mainRate}
                  onChange={(e) =>
                    handleInputChange("mainRate", e.target.value)
                  }
                  className="form-input"
                  placeholder="9.5"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Spring Ref</label>
                <input
                  type="text"
                  value={formData.springRef}
                  onChange={(e) =>
                    handleInputChange("springRef", e.target.value)
                  }
                  className="form-input"
                  placeholder="SPR-95-300"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Length (mm)</label>
                <input
                  type="number"
                  value={formData.length}
                  onChange={(e) => handleInputChange("length", e.target.value)}
                  className="form-input"
                  placeholder="300"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Número de espiras</label>
                <input
                  type="number"
                  value={formData.numeroSpiras}
                  onChange={(e) =>
                    handleInputChange("numeroSpiras", e.target.value)
                  }
                  className="form-input"
                  placeholder="12"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Outer Diameter (mm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.outerDiameter}
                  onChange={(e) =>
                    handleInputChange("outerDiameter", e.target.value)
                  }
                  className="form-input"
                  placeholder="46"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Inner Diameter (mm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.innerDiameter}
                  onChange={(e) =>
                    handleInputChange("innerDiameter", e.target.value)
                  }
                  className="form-input"
                  placeholder="40"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Spire (mm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.spire}
                  onChange={(e) => handleInputChange("spire", e.target.value)}
                  className="form-input"
                  placeholder="2.5"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Rebound Spring</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.rebSpring}
                  onChange={(e) =>
                    handleInputChange("rebSpring", e.target.value)
                  }
                  className="form-input"
                  placeholder="2.0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Total Length (mm)</label>
                <input
                  type="number"
                  value={formData.totalLength}
                  onChange={(e) =>
                    handleInputChange("totalLength", e.target.value)
                  }
                  className="form-input"
                  placeholder="320"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Stroke (mm)</label>
                <input
                  type="number"
                  value={formData.stroke}
                  onChange={(e) => handleInputChange("stroke", e.target.value)}
                  className="form-input"
                  placeholder="120"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Shaft (mm)</label>
                <input
                  type="number"
                  value={formData.shaft}
                  onChange={(e) => handleInputChange("shaft", e.target.value)}
                  className="form-input"
                  placeholder="22"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Piston (mm)</label>
                <input
                  type="number"
                  value={formData.piston}
                  onChange={(e) => handleInputChange("piston", e.target.value)}
                  className="form-input"
                  placeholder="46"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Internal Spacer (mm)</label>
                <input
                  type="number"
                  value={formData.internalSpacer}
                  onChange={(e) =>
                    handleInputChange("internalSpacer", e.target.value)
                  }
                  className="form-input"
                  placeholder="15"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Height (mm)</label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => handleInputChange("height", e.target.value)}
                  className="form-input"
                  placeholder="580"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Stroke to Bump Rubber (mm)</label>
                <input
                  type="number"
                  value={formData.strokeToBumpRubber}
                  onChange={(e) =>
                    handleInputChange("strokeToBumpRubber", e.target.value)
                  }
                  className="form-input"
                  placeholder="110"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Rod (mm)</label>
                <input
                  type="number"
                  value={formData.rod}
                  onChange={(e) => handleInputChange("rod", e.target.value)}
                  className="form-input"
                  placeholder="22"
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
                  value={formData.oil}
                  onChange={(e) => handleInputChange("oil", e.target.value)}
                  className="form-input"
                  placeholder="Fork Oil 7.5W"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Gas</label>
                <input
                  type="text"
                  value={formData.gas}
                  onChange={(e) => handleInputChange("gas", e.target.value)}
                  className="form-input"
                  placeholder="Nitrógeno 10 bar"
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
                  value={formData.compressionOriginal}
                  onChange={(e) =>
                    handleInputChange("compressionOriginal", e.target.value)
                  }
                  className="form-input"
                  placeholder="15"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Compresión Modificada</label>
                <input
                  type="number"
                  value={formData.compressionModification}
                  onChange={(e) =>
                    handleInputChange("compressionModification", e.target.value)
                  }
                  className="form-input"
                  placeholder="12"
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
              {formData.reboundOriginal.map((value, index) => (
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
              {formData.reboundModification.map((value, index) => (
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
              {formData.originalCompressionAdjuster.map((value, index) => (
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
                  />
                </div>
              ))}
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
              {formData.modifiedCompressionAdjuster.map((value, index) => (
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
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Observaciones */}
          <div className="form-section">
            <div className="section-header">
              <FileText size={24} />
              <h2>Observaciones</h2>
            </div>

            <div className="form-group full-width">
              <label className="form-label">Observaciones del servicio</label>
              <textarea
                value={formData.observaciones}
                onChange={(e) =>
                  handleInputChange("observaciones", e.target.value)
                }
                className="form-textarea"
                rows="6"
                placeholder="Describa cualquier observación importante sobre el servicio realizado, problemas encontrados, recomendaciones, etc."
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-cancel"
            >
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="btn-save">
              {saving ? (
                <>
                  <div className="spinner"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Guardar Datos Técnicos RR
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ✅ ESTILOS CSS COMPLETOS */}
      <style jsx>{`
        .app-containerform {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem;
        }

        .form-technical-rr {
          max-width: 1200px;
          margin: 0 auto;
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          overflow: hidden;
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
        }

        .technical-form {
          padding: 2rem;
        }

        .form-section {
          background: #f9fafb;
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
          border: 1px solid #e5e7eb;
        }

        .questionnaire-section {
          background: linear-gradient(
            135deg,
            #fff7ed 0%,
            #fed7aa 20%,
            #fff7ed 100%
          );
          border-left: 4px solid #f97316;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #e5e7eb;
        }

        .section-header svg {
          color: #3b82f6;
          flex-shrink: 0;
        }

        .section-header h2 {
          margin: 0;
          color: #1f2937;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .section-header p {
          margin: 0;
          color: #6b7280;
          font-size: 0.875rem;
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

        .form-label {
          font-weight: 600;
          color: #374151;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .form-input {
          padding: 0.75rem 1rem;
          border: 2px solid #d1d5db;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s;
          background: white;
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

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          gap: 1rem;
        }

        .loading-spinner {
          width: 3rem;
          height: 3rem;
          border: 4px solid #e5e7eb;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @media (max-width: 768px) {
          .app-containerform {
            padding: 1rem;
          }

          .form-header {
            padding: 1.5rem;
          }

          .technical-form {
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
        }
      `}</style>
    </div>
  );
};

export default FormTechnicalRR;
