// components/admin/forms/FormTechnicalDataWithClientData.jsx
import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router";
import { User, Bike, AlertTriangle, CheckCircle, Info } from "lucide-react";
import api from "../../../../services/Api";
import CuestionarioParaTecnico from "./CuestionarioParaTecnico";

function FormTechnicalDataWithClientData({
  formData = {}, // ✅ Valor por defecto para evitar undefined
  handleChange,
  tipoSuspension = "FF",
}) {
  // ✅ CORRECCIÓN PRINCIPAL: Cambiar 'id' por 'motoId'
  const { motoId } = useParams();
  const location = useLocation();

  // ✅ Aceptar tanto clienteId como clientId
  const qs = new URLSearchParams(location.search);
  const clienteId = qs.get("clienteId") ?? qs.get("clientId");

  const [clienteData, setClienteData] = useState(null);
  const [motoData, setMotoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [datosCompletos, setDatosCompletos] = useState(false);
  const [mostrarCuestionario, setMostrarCuestionario] = useState(false);

  // ✅ Inicializar formDataLocal con valores por defecto más robustos
  const [formDataLocal, setFormDataLocal] = useState({
    pesoPiloto: formData.pesoPiloto || "",
    disciplina: formData.disciplina || "",
    numeroOrden: formData.numeroOrden || "",
    observaciones: formData.observaciones || "",
    // Datos de suspensión
    marca: formData.marca || "",
    modelo: formData.modelo || "",
    año: formData.año || "",
    referenciasuspension: formData.referenciasuspension || "",
  });

  useEffect(() => {
    console.log("🔍 Parámetros recibidos:", { motoId, clienteId });
    console.log("🔍 Location search:", location.search);
    console.log("🔍 TipoSuspension:", tipoSuspension);

    if (!motoId) {
      console.error("❌ No se recibió motoId en la URL");
      setError("No se especificó el ID de la motocicleta");
      setLoading(false);
      return;
    }

    cargarDatosClienteYMoto();
  }, [motoId, clienteId]);

  // ✅ Sincronizar con formData del padre cuando cambie
  useEffect(() => {
    if (formData && Object.keys(formData).length > 0) {
      setFormDataLocal((prev) => ({
        ...prev,
        ...formData, // Mantener los datos del padre si existen
      }));
    }
  }, [formData]);

  const cargarDatosClienteYMoto = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔍 Iniciando carga de datos para motoId:", motoId);

      // ✅ Validar que tenemos un motoId válido
      if (!motoId || motoId === "undefined" || motoId === "null") {
        throw new Error("ID de motocicleta no válido");
      }

      // 1. Obtener datos de la moto
      console.log("📞 Llamando a api.getMoto con ID:", motoId);
      const moto = await api.getMoto(motoId);
      console.log("🏍️ Moto obtenida:", moto);
      setMotoData(moto);

      // 2. Obtener datos del cliente
      let cliente = null;

      if (clienteId) {
        // Si tenemos clienteId, buscar directamente
        console.log("👤 Cargando cliente por ID:", clienteId);
        cliente = await api.getCliente(clienteId);
      } else if (moto.cifPropietario) {
        // Si no tenemos clienteId, buscar por CIF
        console.log("🔍 Buscando cliente por CIF:", moto.cifPropietario);
        const clientes = await api.getClientes();
        cliente = clientes.find((c) => c.cif === moto.cifPropietario);
      }

      if (cliente) {
        console.log("✅ Cliente encontrado:", cliente);
        setClienteData(cliente);

        // 3. Pre-llenar el formulario con datos del cuestionario
        const nuevosFormData = {
          ...formDataLocal,
          pesoPiloto: cliente.peso || formDataLocal.pesoPiloto,
          disciplina:
            obtenerDisciplinaFromMoto(moto) || formDataLocal.disciplina,
        };

        setFormDataLocal(nuevosFormData);

        // Notificar al componente padre si existe handleChange
        if (handleChange && typeof handleChange === "function") {
          Object.keys(nuevosFormData).forEach((key) => {
            handleChange({
              target: { name: key, value: nuevosFormData[key] },
            });
          });
        }

        // Verificar si los datos están completos
        verificarDatosCompletos(cliente, moto);
      } else {
        console.log("⚠️ No se encontró cliente asociado");
        // Aunque no haya cliente, permitir continuar
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
    // Mapear especialidad de moto a disciplina
    if (moto.especialidad === "onroad") return "Onroad";
    if (moto.especialidad === "offroad") return "Offroad";
    return "";
  };

  const handleCuestionarioComplete = async (datosFormulario) => {
    try {
      console.log(
        "📝 Guardando datos del cuestionario desde técnico:",
        datosFormulario
      );

      // Guardar usando el endpoint del cuestionario
      const result = await api.saveQuestionnaire(datosFormulario);

      if (result && result.success) {
        console.log("✅ Datos del cuestionario guardados correctamente");

        // Actualizar los datos locales
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

        // Ocultar el cuestionario y marcar como completo
        setMostrarCuestionario(false);
        setDatosCompletos(true);

        // Actualizar el formulario con los nuevos datos
        const nuevosFormData = {
          ...formDataLocal,
          pesoPiloto: datosFormulario.cliente.peso,
          disciplina:
            datosFormulario.motocicletas[0].especialidad === "onroad"
              ? "Onroad"
              : "Offroad",
        };

        setFormDataLocal(nuevosFormData);

        // Notificar al componente padre
        if (handleChange && typeof handleChange === "function") {
          Object.keys(nuevosFormData).forEach((key) => {
            handleChange({
              target: { name: key, value: nuevosFormData[key] },
            });
          });
        }

        alert(
          "✅ Datos del cuestionario guardados correctamente. Ahora puedes continuar con el servicio técnico."
        );
      }
    } catch (error) {
      console.error("❌ Error guardando datos del cuestionario:", error);
      alert("❌ Error al guardar los datos del cuestionario: " + error.message);
    }
  };

  // ✅ Corrección: forzar booleanos y guardar siempre un booleano
  const verificarDatosCompletos = (cliente, moto) => {
    if (!cliente || !moto) return false;

    // Normalizar campos cliente (camel + snake)
    const cPeso = cliente?.peso;
    const cNivel = cliente?.nivelPilotaje ?? cliente?.nivel_pilotaje;
    const cTipo = cliente?.tipoConduccion ?? cliente?.tipo_conduccion;
    const cPref = cliente?.preferenciaRigidez ?? cliente?.preferencia_rigidez;

    // Normalizar campos moto (camel + snake)
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
      clienteData: {
        peso: cPeso,
        nivelPilotaje: cNivel,
        tipoConduccion: cTipo,
        preferenciaRigidez: cPref,
      },
      motoData: {
        especialidad: mEsp,
        tipoConduccion: mTipo,
        preferenciaRigidez: mPref,
      },
    });

    setDatosCompletos(Boolean(completo));
    if (!completo) setMostrarCuestionario(true);
    return completo;
  };

  const handleLocalChange = (e) => {
    const { name, value } = e.target;

    setFormDataLocal((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Notificar al componente padre si existe
    if (handleChange && typeof handleChange === "function") {
      handleChange(e);
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
      {/* ✅ Debug info - Solo en desarrollo */}
      {process.env.NODE_ENV === "development" && (
        <div
          style={{
            background: "#1f2937",
            color: "#10b981",
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1rem",
            fontSize: "0.875rem",
          }}
        >
          <strong>🔍 DEBUG INFO:</strong>
          <br />
          motoId: {motoId}
          <br />
          clienteId: {clienteId}
          <br />
          tipoSuspension: {tipoSuspension}
          <br />
          {/* ✅ Corrección: evitar .toString() sobre null/undefined */}
          datosCompletos: {String(datosCompletos)}
          <br />
          mostrarCuestionario: {String(mostrarCuestionario)}
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

      {/* Formulario Principal */}
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

        <form className="addForm">
          <h2 className="header-title">
            Datos del Servicio -{" "}
            {tipoSuspension === "FF"
              ? "Horquilla Delantera"
              : "Amortiguador Trasero"}
          </h2>

          <legend className="input-label">Peso del Piloto "kg"</legend>
          <input
            className="input-field"
            type="number"
            name="pesoPiloto"
            placeholder="68"
            value={formDataLocal.pesoPiloto}
            onChange={handleLocalChange}
            min="40"
            max="200"
            disabled={!datosCompletos}
          />
          {!clienteData?.peso && (
            <small className="field-note">
              ⚠️ Este dato no está en el cuestionario del cliente. Ingresado
              manualmente.
            </small>
          )}

          <legend className="input-label">Disciplina</legend>
          <select
            className="input-field"
            name="disciplina"
            value={formDataLocal.disciplina}
            onChange={handleLocalChange}
            disabled={!datosCompletos}
          >
            <option value="">Seleccionar disciplina</option>
            <option value="Onroad">Onroad (Carretera)</option>
            <option value="Offroad">Offroad (Campo)</option>
            <option value="Motocross">Motocross</option>
            <option value="Enduro">Enduro</option>
            <option value="Trial">Trial</option>
            <option value="Circuito">Circuito</option>
          </select>

          <legend className="input-label">Número de Orden</legend>
          <input
            className="input-field"
            type="text"
            name="numeroOrden"
            placeholder="002"
            value={formDataLocal.numeroOrden}
            onChange={handleLocalChange}
            disabled={!datosCompletos}
          />

          <legend className="input-label">Observaciones</legend>
          <textarea
            className="input-field"
            name="observaciones"
            placeholder="Observaciones a tener en cuenta"
            rows="4"
            value={formDataLocal.observaciones}
            onChange={handleLocalChange}
            disabled={!datosCompletos}
          />
        </form>

        {/* Datos de Suspensión */}
        <form>
          <h2 className="header-title">Datos Suspensiones</h2>
          <fieldset disabled={!datosCompletos}>
            <legend className="input-label">Marca</legend>
            <input
              className="input-field"
              type="text"
              name="marca"
              placeholder="Marca"
              value={formDataLocal.marca}
              onChange={handleLocalChange}
            />

            <legend className="input-label">Modelo suspensión</legend>
            <input
              className="input-field"
              type="text"
              name="modelo"
              placeholder="Modelo"
              value={formDataLocal.modelo}
              onChange={handleLocalChange}
            />

            <legend className="input-label">Año</legend>
            <input
              className="input-field"
              type="text"
              name="año"
              placeholder="Año"
              value={formDataLocal.año}
              onChange={handleLocalChange}
            />

            <legend className="input-label">Referencia suspensión</legend>
            <input
              className="input-field"
              type="text"
              name="referenciasuspension"
              placeholder="Referencia suspensión"
              value={formDataLocal.referenciasuspension}
              onChange={handleLocalChange}
            />

            {/* Botón para guardar */}
            <button
              type="button"
              className="Newcustom"
              disabled={!datosCompletos}
              onClick={() => {
                console.log("💾 Guardando datos del servicio:", formDataLocal);
                alert("Datos guardados correctamente");
              }}
            >
              Guardar datos del servicio
            </button>
          </fieldset>
        </form>
      </div>

      {/* Estilos del componente */}
      <style>{`
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
          margin-top: 0.25rem;
          font-style: italic;
        }

        .formulario-principal {
          position: relative;
          transition: all 0.3s ease;
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
