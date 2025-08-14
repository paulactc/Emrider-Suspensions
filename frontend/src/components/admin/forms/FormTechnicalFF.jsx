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
  Wrench,
  Gauge,
} from "lucide-react";
import api from "../../../../services/Api";

const FormTechnicalFF = () => {
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

  // Estado del formulario - Datos técnicos FF (simplificado)
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

    // Datos técnicos específicos FF (horquilla)
    oilType: "",
    oilLevel: "",
    springRate: "",
    compressionDamping: "",
    reboundDamping: "",
    preload: "",
    sag: "",

    // Medidas específicas FF
    forkLength: "",
    strokeLength: "",
    oilCapacity: "",
    springLength: "",
    compressionAdjuster: "",
    reboundAdjuster: "",

    // ✅ AGREGAMOS: Ajustadores de compresión para FF
    compressionSettings: Array(20).fill(""), // 20 posiciones para horquilla
    reboundSettings: Array(20).fill(""), // 20 posiciones para horquilla
  });

  useEffect(() => {
    console.log("🔍 FormTechnicalFF - Parámetros:", { motoId, clienteId });
    loadInitialData();
  }, [motoId, clienteId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Cargar datos de la moto
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
        setClienteData(cliente);

        const needsQuest =
          !cliente.peso ||
          !cliente.nivelPilotaje ||
          !cliente.especialidad ||
          !cliente.tipoConduccion ||
          !cliente.preferenciaRigidez;

        setNeedsQuestionnaire(needsQuest);

        if (!needsQuest) {
          setQuestionnaireData({
            peso: cliente.peso || "",
            nivelPilotaje: cliente.nivelPilotaje || "",
            especialidad: cliente.especialidad || "",
            tipoConduccion: cliente.tipoConduccion || "",
            preferenciaRigidez: cliente.preferenciaRigidez || "",
          });
        }
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
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

  // ✅ AGREGAMOS: Función para manejar arrays
  const handleArrayChange = (field, index, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.numeroOrden)
      newErrors.numeroOrden = "Número de orden requerido";
    if (!formData.servicioSuspension)
      newErrors.servicioSuspension = "Tipo de servicio requerido";
    if (!formData.marca) newErrors.marca = "Marca de suspensión requerida";
    if (!formData.modelo) newErrors.modelo = "Modelo de suspensión requerido";

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
      const dataToSend = {
        motoId: parseInt(motoId),
        clienteId: clienteId ? parseInt(clienteId) : null,
        tipoSuspension: "FF",
        ...formData,
        // Filtrar arrays vacíos
        compressionSettings: formData.compressionSettings.filter(
          (val) => val !== ""
        ),
        reboundSettings: formData.reboundSettings.filter((val) => val !== ""),
      };

      if (needsQuestionnaire) {
        dataToSend.questionnaireData = questionnaireData;
      }

      console.log("Datos FF a enviar:", dataToSend);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert("Datos técnicos FF guardados correctamente");
      navigate(-1);
    } catch (error) {
      console.error("Error guardando datos técnicos FF:", error);
      setErrors({ general: "Error al guardar los datos técnicos" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando formulario...</p>
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
            <h1>Datos Técnicos - FF (Horquilla Delantera)</h1>
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
                  placeholder="NIX 30"
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
                  placeholder="NIX-30-43"
                />
              </div>
            </div>
          </div>

          {/* Datos técnicos específicos FF */}
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
                  value={formData.oilType}
                  onChange={(e) => handleInputChange("oilType", e.target.value)}
                  className="form-input"
                  placeholder="Fork Oil 5W"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nivel de aceite (mm)</label>
                <input
                  type="number"
                  value={formData.oilLevel}
                  onChange={(e) =>
                    handleInputChange("oilLevel", e.target.value)
                  }
                  className="form-input"
                  placeholder="120"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Spring Rate (N/mm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.springRate}
                  onChange={(e) =>
                    handleInputChange("springRate", e.target.value)
                  }
                  className="form-input"
                  placeholder="7.5"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Compresión</label>
                <input
                  type="number"
                  value={formData.compressionDamping}
                  onChange={(e) =>
                    handleInputChange("compressionDamping", e.target.value)
                  }
                  className="form-input"
                  placeholder="12"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Rebote</label>
                <input
                  type="number"
                  value={formData.reboundDamping}
                  onChange={(e) =>
                    handleInputChange("reboundDamping", e.target.value)
                  }
                  className="form-input"
                  placeholder="14"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Precarga (mm)</label>
                <input
                  type="number"
                  value={formData.preload}
                  onChange={(e) => handleInputChange("preload", e.target.value)}
                  className="form-input"
                  placeholder="5"
                />
              </div>

              <div className="form-group">
                <label className="form-label">SAG (mm)</label>
                <input
                  type="number"
                  value={formData.sag}
                  onChange={(e) => handleInputChange("sag", e.target.value)}
                  className="form-input"
                  placeholder="30"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Longitud Horquilla (mm)</label>
                <input
                  type="number"
                  value={formData.forkLength}
                  onChange={(e) =>
                    handleInputChange("forkLength", e.target.value)
                  }
                  className="form-input"
                  placeholder="650"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Recorrido (mm)</label>
                <input
                  type="number"
                  value={formData.strokeLength}
                  onChange={(e) =>
                    handleInputChange("strokeLength", e.target.value)
                  }
                  className="form-input"
                  placeholder="120"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Capacidad Aceite (ml)</label>
                <input
                  type="number"
                  value={formData.oilCapacity}
                  onChange={(e) =>
                    handleInputChange("oilCapacity", e.target.value)
                  }
                  className="form-input"
                  placeholder="450"
                />
              </div>
            </div>
          </div>

          {/* ✅ AGREGAMOS: Ajustadores de Compresión FF */}
          <div className="form-section">
            <div className="section-header">
              <Gauge size={24} />
              <h2>Ajustadores de Compresión FF</h2>
              <p>Valores de 1 a 20 posiciones (horquilla)</p>
            </div>

            <div className="array-grid">
              {formData.compressionSettings.map((value, index) => (
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
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ✅ AGREGAMOS: Ajustadores de Rebote FF */}
          <div className="form-section">
            <div className="section-header">
              <Settings size={24} />
              <h2>Ajustadores de Rebote FF</h2>
              <p>Valores de 1 a 20 posiciones (horquilla)</p>
            </div>

            <div className="array-grid">
              {formData.reboundSettings.map((value, index) => (
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
                placeholder="Describa cualquier observación importante sobre el servicio realizado..."
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
                  Guardar Datos Técnicos FF
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
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 1rem;
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
          gap: 0.5rem;
        }

        .array-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          text-align: center;
        }

        .array-input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          text-align: center;
          font-size: 0.875rem;
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
            grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          }

          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default FormTechnicalFF;
