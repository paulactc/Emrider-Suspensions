import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import {
  Bike,
  Save,
  X,
  ArrowLeft,
  Calendar,
  Hash,
  FileText,
  AlertTriangle,
  Navigation,
  Settings,
  Target,
  Plus,
} from "lucide-react";
import api from "../../../../services/Api";

const FormBike = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Determinar si es modo edición o creación
  const isEditMode = Boolean(id);

  // ✅ Obtener datos del cliente desde location.state
  const clienteData = location.state?.clienteData || location.state?.clientData;

  // Estado para los datos de la moto
  const [motoData, setMotoData] = useState({
    id: "",
    marca: "",
    modelo: "",
    anio: "",
    matricula: "",
    bastidor: "",
    cifPropietario: clienteData?.cif || "", // ✅ Pre-llenar con CIF del cliente
    especialidad: "",
    tipoConduccion: "",
    preferenciaRigidez: "",
  });

  const [loading, setLoading] = useState(isEditMode); // Solo loading si es edición
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [originalData, setOriginalData] = useState({});

  // Cargar datos de la moto al montar el componente (solo en modo edición)
  useEffect(() => {
    const cargarDatosMoto = async () => {
      try {
        setLoading(true);
        setErrors({});

        let moto = null;

        // Opción 1: Datos pasados por navegación
        if (location.state?.motoData) {
          moto = location.state.motoData;
          console.log("📝 Datos desde navigation state:", moto);
        }
        // Opción 2: Cargar desde API
        else if (id) {
          console.log("🌐 Cargando moto desde API, ID:", id);
          moto = await api.getMoto(id);
          console.log("📦 Moto desde API:", moto);
        }

        if (!moto && isEditMode) {
          throw new Error("Motocicleta no encontrada");
        }

        // Si hay datos, normalizar
        if (moto) {
          const motoNormalizada = {
            id: moto.id || "",
            marca: moto.marca || "",
            modelo: moto.modelo || "",
            anio: moto.anio || moto.año || moto.anoFabricacion || "",
            matricula: moto.matricula || moto.Matricula || "",
            bastidor: moto.bastidor || "",
            cifPropietario: moto.cifPropietario || moto.cif_propietario || "",
            especialidad: moto.especialidad || "",
            tipoConduccion: moto.tipoConduccion || moto.tipo_conduccion || "",
            preferenciaRigidez:
              moto.preferenciaRigidez || moto.preferencia_rigidez || "",
          };

          console.log("✅ Moto normalizada:", motoNormalizada);
          setMotoData(motoNormalizada);
          setOriginalData(motoNormalizada);
        } else {
          // ✅ En modo creación, usar datos del cliente si están disponibles
          const datosIniciales = {
            id: "",
            marca: "",
            modelo: "",
            anio: "",
            matricula: "",
            bastidor: "",
            cifPropietario: clienteData?.cif || "", // ✅ Pre-llenar CIF
            especialidad: "",
            tipoConduccion: "",
            preferenciaRigidez: "",
          };

          setMotoData(datosIniciales);
          setOriginalData(datosIniciales);
        }
      } catch (error) {
        console.error("❌ Error cargando moto:", error);
        setErrors({
          general: error.message || "Error al cargar la motocicleta",
        });
      } finally {
        setLoading(false);
      }
    };

    // Solo cargar datos si estamos en modo edición
    if (isEditMode) {
      cargarDatosMoto();
    } else {
      // ✅ En modo creación, establecer datos iniciales con CIF del cliente
      const datosIniciales = {
        id: "",
        marca: "",
        modelo: "",
        anio: "",
        matricula: "",
        bastidor: "",
        cifPropietario: clienteData?.cif || "", // ✅ Pre-llenar CIF
        especialidad: "",
        tipoConduccion: "",
        preferenciaRigidez: "",
      };

      setMotoData(datosIniciales);
      setOriginalData(datosIniciales);
      setLoading(false);
    }
  }, [id, location.state, isEditMode, clienteData?.cif]); // ✅ Agregar clienteData.cif a dependencias

  // Validación
  const validarCampos = () => {
    const nuevosErrores = {};

    if (!motoData.marca?.trim()) {
      nuevosErrores.marca = "La marca es obligatoria";
    }

    if (!motoData.modelo?.trim()) {
      nuevosErrores.modelo = "El modelo es obligatorio";
    }

    if (!motoData.anio) {
      nuevosErrores.anio = "El año es obligatorio";
    } else if (
      motoData.anio < 1990 ||
      motoData.anio > new Date().getFullYear() + 1
    ) {
      nuevosErrores.anio = `El año debe estar entre 1990 y ${
        new Date().getFullYear() + 1
      }`;
    }

    if (!motoData.matricula?.trim()) {
      nuevosErrores.matricula = "La matrícula es obligatoria";
    }

    if (!motoData.cifPropietario?.trim()) {
      nuevosErrores.cifPropietario = "El CIF del propietario es obligatorio";
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Manejar cambios en los inputs
  const handleInputChange = (campo, valor) => {
    setMotoData((prev) => ({
      ...prev,
      [campo]: valor,
    }));

    // Limpiar error del campo si existe
    if (errors[campo]) {
      setErrors((prev) => ({
        ...prev,
        [campo]: "",
      }));
    }
  };

  // Guardar cambios (crear o actualizar)
  const handleGuardar = async () => {
    if (!validarCampos()) {
      console.log("❌ Validación falló:", errors);
      return;
    }

    setSaving(true);
    try {
      console.log(
        `💾 ${isEditMode ? "Actualizando" : "Creando"} moto:`,
        motoData
      );

      // Preparar datos para enviar
      const motoNormalizada = {
        marca: motoData.marca?.trim(),
        modelo: motoData.modelo?.trim(),
        anio: parseInt(motoData.anio),
        matricula: motoData.matricula?.trim(),
        bastidor: motoData.bastidor?.trim() || null,
        cifPropietario: motoData.cifPropietario?.trim(),
        especialidad: motoData.especialidad || null,
        tipoConduccion: motoData.tipoConduccion || null,
        preferenciaRigidez: motoData.preferenciaRigidez || null,
      };

      console.log("📤 Datos normalizados a enviar:", motoNormalizada);

      if (isEditMode) {
        // Modo edición
        const motoId = parseInt(motoData.id);
        if (isNaN(motoId)) {
          throw new Error("ID de la motocicleta no válido");
        }
        await api.updateMoto(motoId, motoNormalizada);
        console.log("✅ Moto actualizada correctamente");
        alert("✅ Motocicleta actualizada correctamente");
      } else {
        // Modo creación
        await api.createMoto(motoNormalizada);
        console.log("✅ Moto creada correctamente");
        alert("✅ Motocicleta creada correctamente");
      }

      navigate(-1);
    } catch (error) {
      console.error("❌ Error guardando moto:", error);

      let mensajeError = "Error desconocido";
      if (error.message.includes("500")) {
        mensajeError = "Error interno del servidor. Verifica los datos.";
      } else if (error.message.includes("400")) {
        mensajeError = "Datos inválidos. Revisa los campos obligatorios.";
      } else if (error.message.includes("404")) {
        mensajeError = "Motocicleta no encontrada.";
      } else if (error.message.includes("409")) {
        mensajeError = "Ya existe una motocicleta con esa matrícula.";
      } else {
        mensajeError = error.message;
      }

      setErrors({ general: mensajeError });
      alert(
        `❌ Error al ${isEditMode ? "actualizar" : "crear"}: ${mensajeError}`
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancelar = () => {
    navigate(-1);
  };

  // Verificar si hay cambios
  const hayChangios = JSON.stringify(motoData) !== JSON.stringify(originalData);

  if (loading) {
    return (
      <div className="app-containerform">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando datos de la motocicleta...</p>
        </div>
      </div>
    );
  }

  if (errors.general) {
    return (
      <div className="app-containerform">
        <div className="error-container">
          <AlertTriangle size={48} />
          <h3>Error al cargar la motocicleta</h3>
          <p>{errors.general}</p>
          <button onClick={() => navigate(-1)} className="Newcustom">
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-containerform">
      {/* Header */}
      <div className="form-header">
        <button onClick={handleCancelar} className="Newcustom">
          <ArrowLeft className="w-5 h-5" />
          <span>Volver</span>
        </button>
        <div className="header-content">
          <div className="flex items-center space-x-3">
            <Bike className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="header-title">
                {isEditMode ? "Editar" : "Nueva"} Motocicleta
              </h1>
              {isEditMode && (
                <p className="text-gray-600">
                  {motoData.marca} {motoData.modelo} - {motoData.matricula}
                </p>
              )}
              {/* ✅ Mostrar información del cliente si está disponible */}
              {clienteData && !isEditMode && (
                <p className="text-gray-600">
                  Para: {clienteData.nombre} {clienteData.apellidos}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="addForm">
        <h2 className="header-title">Datos de la Motocicleta</h2>

        <fieldset className="addForm__group">
          {/* Datos básicos */}
          <div className="form-section-basic">
            <legend className="input-label">
              <FileText className="w-4 h-4 inline mr-2" />
              Marca *
            </legend>
            <input
              className={`input-field ${errors.marca ? "input-error" : ""}`}
              type="text"
              value={motoData.marca}
              onChange={(e) => handleInputChange("marca", e.target.value)}
              placeholder="Honda, Yamaha, Kawasaki..."
            />
            {errors.marca && <p className="error-text">{errors.marca}</p>}

            <legend className="input-label">
              <Bike className="w-4 h-4 inline mr-2" />
              Modelo *
            </legend>
            <input
              className={`input-field ${errors.modelo ? "input-error" : ""}`}
              type="text"
              value={motoData.modelo}
              onChange={(e) => handleInputChange("modelo", e.target.value)}
              placeholder="CBR 600, MT-07, Ninja 650..."
            />
            {errors.modelo && <p className="error-text">{errors.modelo}</p>}

            <legend className="input-label">
              <Calendar className="w-4 h-4 inline mr-2" />
              Año de fabricación *
            </legend>
            <input
              className={`input-field ${errors.anio ? "input-error" : ""}`}
              type="number"
              value={motoData.anio}
              onChange={(e) => handleInputChange("anio", e.target.value)}
              placeholder="2023"
              min="1990"
              max={new Date().getFullYear() + 1}
            />
            {errors.anio && <p className="error-text">{errors.anio}</p>}

            <legend className="input-label">
              <Hash className="w-4 h-4 inline mr-2" />
              Matrícula *
            </legend>
            <input
              className={`input-field ${errors.matricula ? "input-error" : ""}`}
              type="text"
              value={motoData.matricula}
              onChange={(e) => handleInputChange("matricula", e.target.value)}
              placeholder="1234ABC"
            />
            {errors.matricula && (
              <p className="error-text">{errors.matricula}</p>
            )}

            <legend className="input-label">
              <FileText className="w-4 h-4 inline mr-2" />
              Bastidor
            </legend>
            <input
              className="input-field"
              type="text"
              value={motoData.bastidor}
              onChange={(e) => handleInputChange("bastidor", e.target.value)}
              placeholder="WB10175B97ZT03412"
            />

            <legend className="input-label">
              <FileText className="w-4 h-4 inline mr-2" />
              CIF del Propietario *
              {/* ✅ Mostrar indicador si se auto-completó */}
              {clienteData && (
                <span className="text-green-600 text-sm ml-2">
                  (Completado automáticamente)
                </span>
              )}
            </legend>
            <input
              className={`input-field ${
                errors.cifPropietario ? "input-error" : ""
              } ${clienteData ? "bg-green-50" : ""}`} // ✅ Resaltar si viene del cliente
              type="text"
              value={motoData.cifPropietario}
              onChange={(e) =>
                handleInputChange("cifPropietario", e.target.value)
              }
              placeholder="A12345678"
              readOnly={!!clienteData} // ✅ Solo lectura si viene del cliente
            />
            {errors.cifPropietario && (
              <p className="error-text">{errors.cifPropietario}</p>
            )}
          </div>

          {/* Datos del cuestionario */}
          <div className="form-section-questionnaire">
            <h3 className="section-subtitle">
              <Target className="w-5 h-5 inline mr-2" />
              Configuración de Suspensión
            </h3>
            <p className="section-description">
              Estos datos provienen del cuestionario del cliente
            </p>

            <legend className="input-label">
              <Navigation className="w-4 h-4 inline mr-2" />
              Especialidad
            </legend>
            <select
              className="input-field"
              value={motoData.especialidad}
              onChange={(e) =>
                handleInputChange("especialidad", e.target.value)
              }
            >
              <option value="">Seleccionar especialidad</option>
              <option value="onroad">On Road (Carretera)</option>
              <option value="offroad">Off Road (Campo)</option>
            </select>

            <legend className="input-label">
              <Settings className="w-4 h-4 inline mr-2" />
              Tipo de Conducción
            </legend>
            <select
              className="input-field"
              value={motoData.tipoConduccion}
              onChange={(e) =>
                handleInputChange("tipoConduccion", e.target.value)
              }
            >
              <option value="">Seleccionar tipo</option>
              <option value="calle">Calle</option>
              <option value="circuito-asfalto">Circuito Asfalto</option>
              <option value="circuito-tierra">Circuito Tierra</option>
            </select>

            <legend className="input-label">
              <Settings className="w-4 h-4 inline mr-2" />
              Preferencia de Rigidez
            </legend>
            <select
              className="input-field"
              value={motoData.preferenciaRigidez}
              onChange={(e) =>
                handleInputChange("preferenciaRigidez", e.target.value)
              }
            >
              <option value="">Seleccionar preferencia</option>
              <option value="blando">Más Blando (Comodidad)</option>
              <option value="duro">Más Duro (Precisión)</option>
            </select>
          </div>

          {/* Botones de acción */}
          <div className="form-actions">
            <button
              onClick={handleCancelar}
              className="Newcustom btn-cancel"
              disabled={saving}
            >
              <X className="w-4 h-4" />
              <span>Cancelar</span>
            </button>

            <button
              onClick={handleGuardar}
              disabled={saving || (!isEditMode ? false : !hayChangios)}
              className="Newcustom btn-save"
            >
              {saving ? (
                <>
                  <div className="spinner"></div>
                  <span>{isEditMode ? "Guardando..." : "Creando..."}</span>
                </>
              ) : (
                <>
                  {isEditMode ? (
                    <Save className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  <span>
                    {isEditMode ? "Guardar Cambios" : "Crear Motocicleta"}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Indicadores de estado */}
          {isEditMode && hayChangios && (
            <div className="status-indicator warning">
              <AlertTriangle className="w-4 h-4" />
              <span>Hay cambios sin guardar</span>
            </div>
          )}
        </fieldset>
      </div>
    </div>
  );
};

export default FormBike;
