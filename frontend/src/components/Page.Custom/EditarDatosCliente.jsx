import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Code,
  Building,
  Save,
  X,
  Edit3,
  ArrowLeft,
  FileUser,
} from "lucide-react";

const EditarDatosCliente = ({ listCustom = [], updateCliente }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Estado corregido con nombres de campos correctos
  const [cliente, setCliente] = useState({
    id: "",
    nombre: "",
    apellidos: "",
    telefono: "",
    direccion: "",
    codigo_postal: "",
    poblacion: "",
    provincia: "",
    cif: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [originalData, setOriginalData] = useState({});

  // ✅ Cargar datos del cliente corregido
  useEffect(() => {
    const cargarDatosCliente = async () => {
      setLoading(true);
      try {
        let clienteData = null;

        // Opción 1: Datos pasados por navegación
        if (location.state?.clienteData || location.state?.clientData) {
          clienteData = location.state.clienteData || location.state.clientData;
          console.log("📝 Datos desde navigation state:", clienteData);
        }
        // Opción 2: Buscar en la lista de clientes
        else if (listCustom && listCustom.length > 0) {
          clienteData = listCustom.find((c) => String(c.id) === String(id));
          console.log("📝 Datos desde listCustom:", clienteData);
        }

        if (!clienteData) {
          throw new Error("Cliente no encontrado");
        }

        // ✅ Mapear datos correctamente
        const clienteNormalizado = {
          id: clienteData.id || "",
          nombre: clienteData.nombre || "",
          apellidos: clienteData.apellidos || "",
          telefono: clienteData.telefono || "",
          direccion: clienteData.direccion || clienteData.Dirección || "",
          codigo_postal:
            clienteData.codigo_postal || clienteData.CódigoPostal || "",
          poblacion: clienteData.poblacion || clienteData.Población || "",
          provincia: clienteData.provincia || clienteData.Provincia || "",
          cif: clienteData.cif || "",
        };

        console.log("✅ Cliente normalizado:", clienteNormalizado);
        setCliente(clienteNormalizado);
        setOriginalData(clienteNormalizado);
      } catch (error) {
        console.error("❌ Error cargando cliente:", error);
        alert(`Error: ${error.message}`);
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      cargarDatosCliente();
    }
  }, [id, location.state, listCustom, navigate]);

  // ✅ Validación corregida
  const validarCampos = () => {
    const nuevosErrores = {};

    if (!cliente.nombre?.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio";
    }

    if (!cliente.apellidos?.trim()) {
      nuevosErrores.apellidos = "Los apellidos son obligatorios";
    }

    if (!cliente.telefono?.trim()) {
      nuevosErrores.telefono = "El teléfono es obligatorio";
    }

    if (!cliente.direccion?.trim()) {
      nuevosErrores.direccion = "La dirección es obligatoria";
    }

    if (!cliente.codigo_postal?.trim()) {
      nuevosErrores.codigo_postal = "El código postal es obligatorio";
    } else if (!/^\d{5}$/.test(cliente.codigo_postal)) {
      nuevosErrores.codigo_postal = "El código postal debe tener 5 dígitos";
    }

    if (!cliente.poblacion?.trim()) {
      nuevosErrores.poblacion = "La población es obligatoria";
    }

    if (!cliente.provincia?.trim()) {
      nuevosErrores.provincia = "La provincia es obligatoria";
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // ✅ Manejar cambios corregido
  const handleInputChange = (campo, valor) => {
    setCliente((prev) => ({
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

  // 🔧 MÉTODO CORREGIDO - Guardar cambios
  const handleGuardar = async () => {
    if (!validarCampos()) {
      console.log("❌ Validación falló:", errors);
      return;
    }

    if (!updateCliente) {
      console.error("❌ Función updateCliente no disponible");
      alert("Error: Función de actualización no disponible");
      return;
    }

    setSaving(true);
    try {
      console.log("💾 Guardando cliente:", cliente);

      // 🔧 DATOS NORMALIZADOS SIN INCLUIR ID EN EL BODY
      const clienteNormalizado = {
        // 🚨 NO incluir el ID en el body - solo en la URL
        nombre: cliente.nombre?.trim(),
        apellidos: cliente.apellidos?.trim(),
        telefono: cliente.telefono?.trim(),
        direccion: cliente.direccion?.trim(),
        codigo_postal: cliente.codigo_postal?.trim(),
        poblacion: cliente.poblacion?.trim(),
        provincia: cliente.provincia?.trim(),
        cif: cliente.cif?.trim() || null, // CIF puede ser null
      };

      // ✅ VALIDAR que no hay campos undefined o vacíos críticos
      const camposRequeridos = ["nombre", "apellidos", "telefono", "direccion"];
      const camposFaltantes = camposRequeridos.filter(
        (campo) =>
          !clienteNormalizado[campo] || clienteNormalizado[campo] === ""
      );

      if (camposFaltantes.length > 0) {
        throw new Error(
          `Campos requeridos faltantes: ${camposFaltantes.join(", ")}`
        );
      }

      console.log("📤 Datos normalizados a enviar:", clienteNormalizado);
      console.log("🆔 ID del cliente:", cliente.id);

      // 🔧 ASEGURAR QUE EL ID SEA NUMÉRICO
      const clienteId = parseInt(cliente.id);
      if (isNaN(clienteId)) {
        throw new Error("ID del cliente no válido");
      }

      // ✅ Usar la función updateCliente pasada como prop
      await updateCliente(clienteId, clienteNormalizado);

      console.log("✅ Cliente actualizado correctamente");
      alert("✅ Datos actualizados correctamente");
      navigate(-1);
    } catch (error) {
      console.error("❌ Error guardando datos:", error);

      // ✅ MEJOR MANEJO DE ERRORES
      let mensajeError = "Error desconocido";
      if (error.message.includes("500")) {
        mensajeError =
          "Error interno del servidor. Verifica que todos los datos sean válidos.";
      } else if (error.message.includes("400")) {
        mensajeError = "Datos inválidos. Revisa los campos obligatorios.";
      } else if (error.message.includes("404")) {
        mensajeError = "Cliente no encontrado en el servidor.";
      } else {
        mensajeError = error.message;
      }

      alert(`❌ Error al guardar: ${mensajeError}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelar = () => {
    navigate(-1);
  };

  // Verificar si hay cambios
  const hayChanges = JSON.stringify(cliente) !== JSON.stringify(originalData);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-lg">Cargando datos del cliente...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="app-containerform">
      <div>
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg mb-6 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={handleCancelar} className="Newcustom">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
                <span>Volver</span>
              </button>
              <div className="flex items-center space-x-3">
                <Edit3 className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="header-title">Editar Cliente</h1>
                  <p className="text-gray-600">
                    {cliente.nombre} {cliente.apellidos}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div>
              <label className="input-label">
                <User className="w-4 h-4 inline mr-2" />
                Nombre *
              </label>
              <input
                type="text"
                value={cliente.nombre || ""}
                onChange={(e) => handleInputChange("nombre", e.target.value)}
                className={`input-field ${errors.nombre ? "input-error" : ""}`}
                placeholder="Nombre del cliente"
              />
              {errors.nombre && (
                <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
              )}
            </div>

            {/* Apellidos */}
            <div>
              <label className="input-label">
                <User className="w-4 h-4 inline mr-2" />
                Apellidos *
              </label>
              <input
                type="text"
                value={cliente.apellidos || ""}
                onChange={(e) => handleInputChange("apellidos", e.target.value)}
                className={`input-field ${
                  errors.apellidos ? "input-error" : ""
                }`}
                placeholder="Apellidos del cliente"
              />
              {errors.apellidos && (
                <p className="mt-1 text-sm text-red-600">{errors.apellidos}</p>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label className="input-label">
                <Phone className="w-4 h-4 inline mr-2" />
                Teléfono *
              </label>
              <input
                type="tel"
                value={cliente.telefono || ""}
                onChange={(e) => handleInputChange("telefono", e.target.value)}
                className={`input-field ${
                  errors.telefono ? "input-error" : ""
                }`}
                placeholder="666 123 456"
              />
              {errors.telefono && (
                <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>
              )}
            </div>

            {/* CIF */}
            <div>
              <label className="input-label">
                <FileUser className="w-4 h-4 inline mr-2" />
                CIF
              </label>
              <input
                type="text"
                value={cliente.cif || ""}
                onChange={(e) => handleInputChange("cif", e.target.value)}
                className="input-field"
                placeholder="A12345678"
              />
            </div>

            {/* Dirección */}
            <div className="md:col-span-2">
              <label className="input-label">
                <MapPin className="w-4 h-4 inline mr-2" />
                Dirección *
              </label>
              <input
                type="text"
                value={cliente.direccion || ""}
                onChange={(e) => handleInputChange("direccion", e.target.value)}
                className={`input-field ${
                  errors.direccion ? "input-error" : ""
                }`}
                placeholder="Calle, número, piso, puerta..."
              />
              {errors.direccion && (
                <p className="mt-1 text-sm text-red-600">{errors.direccion}</p>
              )}
            </div>

            {/* Código Postal */}
            <div>
              <label className="input-label">
                <Code className="w-4 h-4 inline mr-2" />
                Código Postal *
              </label>
              <input
                type="text"
                value={cliente.codigo_postal || ""}
                onChange={(e) =>
                  handleInputChange("codigo_postal", e.target.value)
                }
                className={`input-field ${
                  errors.codigo_postal ? "input-error" : ""
                }`}
                placeholder="28001"
                maxLength="5"
              />
              {errors.codigo_postal && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.codigo_postal}
                </p>
              )}
            </div>

            {/* Población */}
            <div>
              <label className="input-label">
                <Building className="w-4 h-4 inline mr-2" />
                Población *
              </label>
              <input
                type="text"
                value={cliente.poblacion || ""}
                onChange={(e) => handleInputChange("poblacion", e.target.value)}
                className={`input-field ${
                  errors.poblacion ? "input-error" : ""
                }`}
                placeholder="Madrid"
              />
              {errors.poblacion && (
                <p className="mt-1 text-sm text-red-600">{errors.poblacion}</p>
              )}
            </div>

            {/* Provincia */}
            <div className="md:col-span-2">
              <label className="input-label">
                <MapPin className="w-4 h-4 inline mr-2" />
                Provincia *
              </label>
              <input
                type="text"
                value={cliente.provincia || ""}
                onChange={(e) => handleInputChange("provincia", e.target.value)}
                className={`input-field ${
                  errors.provincia ? "input-error" : ""
                }`}
                placeholder="Madrid"
              />
              {errors.provincia && (
                <p className="mt-1 text-sm text-red-600">{errors.provincia}</p>
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t">
            <button
              onClick={handleCancelar}
              className="Newcustom"
              disabled={saving}
            >
              <X className="w-4 h-4" />
              <span>Cancelar</span>
            </button>

            <button
              onClick={handleGuardar}
              disabled={saving || !hayChanges || !updateCliente}
              className="Newcustom"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>

          {/* Indicadores de estado */}
          {!updateCliente && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                ⚠️ Función de actualización no disponible
              </p>
            </div>
          )}

          {hayChanges && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Hay cambios sin guardar
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditarDatosCliente;
