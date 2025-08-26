// frontend/src/components/admin/forms/CuestionarioParaTecnico.jsx
import React, { useState } from "react";
import {
  User,
  Bike,
  Save,
  AlertTriangle,
  Weight,
  Target,
  Navigation,
  Mountain,
  Settings,
  CheckCircle,
} from "lucide-react";

const CuestionarioParaTecnico = ({
  cliente,
  moto,
  onComplete,
  datosActuales = {},
}) => {
  const [formData, setFormData] = useState({
    // Datos del cliente
    peso: cliente?.peso || datosActuales.peso || "",
    nivelPilotaje: cliente?.nivelPilotaje || datosActuales.nivelPilotaje || "",
    // Datos de la moto
    especialidad: moto?.especialidad || datosActuales.especialidad || "",
    tipoConduccion: moto?.tipoConduccion || datosActuales.tipoConduccion || "",
    preferenciaRigidez:
      moto?.preferenciaRigidez || datosActuales.preferenciaRigidez || "",
  });

  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Limpiar error del campo
    if (errores[field]) {
      setErrores((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.peso) {
      nuevosErrores.peso = "El peso es obligatorio";
    } else if (formData.peso < 40 || formData.peso > 200) {
      nuevosErrores.peso = "El peso debe estar entre 40 y 200 kg";
    }

    if (!formData.nivelPilotaje) {
      nuevosErrores.nivelPilotaje = "El nivel de pilotaje es obligatorio";
    }

    if (!formData.especialidad) {
      nuevosErrores.especialidad = "La especialidad es obligatoria";
    }

    if (!formData.tipoConduccion) {
      nuevosErrores.tipoConduccion = "El tipo de conducción es obligatorio";
    }

    if (!formData.preferenciaRigidez) {
      nuevosErrores.preferenciaRigidez =
        "La preferencia de rigidez es obligatoria";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleGuardar = async () => {
    if (!validarFormulario()) {
      return;
    }

    setGuardando(true);
    try {
      // Preparar datos para enviar
      const datosParaGuardar = {
        cliente: {
          id: cliente.id,
          peso: parseFloat(formData.peso),
          nivelPilotaje: formData.nivelPilotaje,
        },
        motocicletas: [
          {
            id: moto.id,
            especialidad: formData.especialidad,
            tipoConduccion: formData.tipoConduccion,
            preferenciaRigidez: formData.preferenciaRigidez,
          },
        ],
      };

      await onComplete(datosParaGuardar);
    } catch (error) {
      console.error("Error guardando datos del cuestionario:", error);
      alert("Error al guardar los datos. Inténtalo de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  const tieneClienteCompleto = cliente?.peso && cliente?.nivelPilotaje;
  const tieneMotoCompleta =
    moto?.especialidad && moto?.tipoConduccion && moto?.preferenciaRigidez;

  return (
    <div className="cuestionario-tecnico-container">
      <div className="cuestionario-header">
        <AlertTriangle className="warning-icon" />
        <div className="header-content">
          <h2>Completar Datos del Cuestionario</h2>
          <p>
            Es necesario completar estos datos antes de crear el servicio
            técnico
          </p>
        </div>
      </div>

      {/* Estado actual de los datos */}
      <div className="estado-datos">
        <div
          className={`estado-item ${
            tieneClienteCompleto ? "completo" : "incompleto"
          }`}
        >
          <User className="estado-icon" />
          <span>Datos del Cliente</span>
          {tieneClienteCompleto ? (
            <CheckCircle className="check-icon" />
          ) : (
            <AlertTriangle className="warning-icon" />
          )}
        </div>
        <div
          className={`estado-item ${
            tieneMotoCompleta ? "completo" : "incompleto"
          }`}
        >
          <Bike className="estado-icon" />
          <span>Datos de la Moto</span>
          {tieneMotoCompleta ? (
            <CheckCircle className="check-icon" />
          ) : (
            <AlertTriangle className="warning-icon" />
          )}
        </div>
      </div>

      <div className="formulario-sections">
        {/* Sección Cliente */}
        <div className="form-section">
          <div className="section-header">
            <User className="section-icon" />
            <h3>Datos del Cliente</h3>
          </div>

          <div className="fields-grid">
            <div className="field-group">
              <label className="field-label">
                <Weight className="field-icon" />
                Peso del Piloto (kg) *
              </label>
              <input
                type="number"
                value={formData.peso}
                onChange={(e) => handleInputChange("peso", e.target.value)}
                className={`input-field ${errores.peso ? "error" : ""}`}
                placeholder="Ej: 75"
                min="40"
                max="200"
              />
              {errores.peso && (
                <span className="error-message">{errores.peso}</span>
              )}
            </div>

            <div className="field-group">
              <label className="field-label">
                <Target className="field-icon" />
                Nivel de Pilotaje *
              </label>
              <select
                value={formData.nivelPilotaje}
                onChange={(e) =>
                  handleInputChange("nivelPilotaje", e.target.value)
                }
                className={`input-field ${
                  errores.nivelPilotaje ? "error" : ""
                }`}
              >
                <option value="">Seleccionar nivel</option>
                <option value="principiante">Principiante</option>
                <option value="novato">Novato</option>
                <option value="intermedio">Intermedio</option>
                <option value="experto">Experto</option>
                <option value="profesional">Profesional</option>
              </select>
              {errores.nivelPilotaje && (
                <span className="error-message">{errores.nivelPilotaje}</span>
              )}
            </div>
          </div>
        </div>

        {/* Sección Moto */}
        <div className="form-section">
          <div className="section-header">
            <Bike className="section-icon" />
            <h3>Configuración de la Motocicleta</h3>
          </div>

          <div className="fields-grid">
            <div className="field-group">
              <label className="field-label">
                <Navigation className="field-icon" />
                Especialidad *
              </label>
              <select
                value={formData.especialidad}
                onChange={(e) =>
                  handleInputChange("especialidad", e.target.value)
                }
                className={`input-field ${errores.especialidad ? "error" : ""}`}
              >
                <option value="">Seleccionar especialidad</option>
                <option value="onroad">On Road (Carretera)</option>
                <option value="offroad">Off Road (Campo)</option>
              </select>
              {errores.especialidad && (
                <span className="error-message">{errores.especialidad}</span>
              )}
            </div>

            <div className="field-group">
              <label className="field-label">
                <Settings className="field-icon" />
                Tipo de Conducción *
              </label>
              <select
                value={formData.tipoConduccion}
                onChange={(e) =>
                  handleInputChange("tipoConduccion", e.target.value)
                }
                className={`input-field ${
                  errores.tipoConduccion ? "error" : ""
                }`}
              >
                <option value="">Seleccionar tipo</option>
                <option value="calle">Calle</option>
                <option value="circuito-asfalto">Circuito Asfalto</option>
                <option value="circuito-tierra">Circuito Tierra</option>
              </select>
              {errores.tipoConduccion && (
                <span className="error-message">{errores.tipoConduccion}</span>
              )}
            </div>

            <div className="field-group">
              <label className="field-label">
                <Settings className="field-icon" />
                Preferencia de Rigidez *
              </label>
              <select
                value={formData.preferenciaRigidez}
                onChange={(e) =>
                  handleInputChange("preferenciaRigidez", e.target.value)
                }
                className={`input-field ${
                  errores.preferenciaRigidez ? "error" : ""
                }`}
              >
                <option value="">Seleccionar preferencia</option>
                <option value="blando">Más Blando (Comodidad)</option>
                <option value="duro">Más Duro (Precisión)</option>
              </select>
              {errores.preferenciaRigidez && (
                <span className="error-message">
                  {errores.preferenciaRigidez}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Botón de guardar */}
      <div className="form-actions">
        <button
          onClick={handleGuardar}
          disabled={guardando}
          className="btn-guardar"
        >
          {guardando ? (
            "Guardando..."
          ) : (
            <>
              <Save className="btn-icon" />
              Guardar y Continuar
            </>
          )}
        </button>
      </div>

      <style jsx>{`
        .cuestionario-tecnico-container {
          background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
          border: 2px solid #f59e0b;
        }

        .cuestionario-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #374151;
        }

        .warning-icon {
          color: #f59e0b;
          width: 2rem;
          height: 2rem;
          flex-shrink: 0;
        }

        .header-content h2 {
          color: #f9fafb;
          margin: 0 0 0.5rem 0;
          font-size: 1.5rem;
        }

        .header-content p {
          color: #d1d5db;
          margin: 0;
        }

        .estado-datos {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .estado-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-weight: 500;
        }

        .estado-item.completo {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid #dce4e1ff;
          color: #74837eff;
        }

        .estado-item.incompleto {
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid #f59e0b;
          color: #f59e0b;
        }

        .estado-icon,
        .check-icon {
          width: 1.25rem;
          height: 1.25rem;
        }

        .formulario-sections {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .form-section {
          background: rgba(55, 65, 81, 0.5);
          border-radius: 8px;
          padding: 1.5rem;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #4b5563;
        }

        .section-icon {
          color: #fbbf24;
          width: 1.5rem;
          height: 1.5rem;
        }

        .section-header h3 {
          color: #f9fafb;
          margin: 0;
          font-size: 1.25rem;
        }

        .fields-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .field-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #d1d5db;
          font-weight: 500;
          font-size: 0.875rem;
        }

        .field-icon {
          width: 1rem;
          height: 1rem;
          color: #fbbf24;
        }

        .input-field {
          padding: 0.75rem 1rem;
          background: #374151;
          border: 1px solid #4b5563;
          border-radius: 6px;
          color: #f9fafb;
          font-size: 1rem;
          transition: all 0.2s;
        }

        .input-field:focus {
          outline: none;
          border-color: #fbbf24;
          box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1);
        }

        .input-field.error {
          border-color: #ef4444;
        }

        .error-message {
          color: #ef4444;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }

        .form-actions {
          display: flex;
          justify-content: center;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #374151;
        }

        .btn-guardar {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-guardar:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
        }

        .btn-guardar:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-icon {
          width: 1.25rem;
          height: 1.25rem;
        }

        @media (max-width: 768px) {
          .cuestionario-tecnico-container {
            padding: 1rem;
          }

          .estado-datos {
            flex-direction: column;
          }

          .fields-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default CuestionarioParaTecnico;
