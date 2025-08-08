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
} from "lucide-react";

const EditarDatosCliente = ({ listCustom = [] }) => {
  const { id } = useParams(); // Obtener el ID del cliente de la URL
  const navigate = useNavigate();
  const location = useLocation();

  // Estado para los datos del cliente
  const [cliente, setCliente] = useState({
    id: "",
    Cliente: "",
    Email: "",
    telefono: "",
    Dirección: "",
    CódigoPostal: "",
    Población: "",
    Provincia: "",
  });

  // Estados para manejo de la UI
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [originalData, setOriginalData] = useState({});

  // Cargar datos del cliente
  useEffect(() => {
    const cargarDatosCliente = async () => {
      setLoading(true);
      try {
        if (location.state?.clienteData) {
          const data = location.state.clienteData;
          setCliente(data);
          setOriginalData(data);
        } else {
          const clienteBuscado = listCustom.find(
            (c) => String(c.id) === String(id)
          );
          if (clienteBuscado) {
            setCliente(clienteBuscado);
            setOriginalData(clienteBuscado);
          } else {
            console.error("Cliente no encontrado en lista");
            alert("No se encontró el cliente");
            navigate(-1);
          }
        }
      } catch (error) {
        console.error("Error cargando datos del cliente:", error);
        alert("Ocurrió un error al cargar los datos.");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    cargarDatosCliente();
  }, [id, location.state, listCustom, navigate]);

  // Validación de campos
  const validarCampos = () => {
    const nuevosErrores = {};

    if (!cliente.Cliente?.trim()) {
      nuevosErrores.Cliente = "El nombre del cliente es obligatorio";
    }

    if (!cliente.Email?.trim()) {
      nuevosErrores.Email = "El email es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(cliente.Email)) {
      nuevosErrores.Email = "El email no es válido";
    }

    if (!cliente.telefono?.trim()) {
      nuevosErrores.telefono = "El teléfono es obligatorio";
    }

    if (!cliente.Dirección?.trim()) {
      nuevosErrores.Dirección = "La dirección es obligatoria";
    }

    if (!cliente.CódigoPostal?.trim()) {
      nuevosErrores.CódigoPostal = "El código postal es obligatorio";
    } else if (!/^\d{5}$/.test(cliente.CódigoPostal)) {
      nuevosErrores.CódigoPostal = "El código postal debe tener 5 dígitos";
    }

    if (!cliente.Población?.trim()) {
      nuevosErrores.Población = "La población es obligatoria";
    }

    if (!cliente.Provincia?.trim()) {
      nuevosErrores.Provincia = "La provincia es obligatoria";
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Manejar cambios en los inputs
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

  // Guardar cambios
  const handleGuardar = async () => {
    if (!validarCampos()) {
      return;
    }

    setSaving(true);
    try {
      // Aquí harías la petición PUT/PATCH a tu API
      // const response = await fetch(`/api/clientes/${id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(cliente)
      // });

      // if (!response.ok) {
      //   throw new Error('Error al actualizar cliente');
      // }

      // Simular petición exitosa
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert("Datos actualizados correctamente");

      // Volver a la página anterior o a la lista de clientes
      navigate(-1);
    } catch (error) {
      console.error("Error guardando datos:", error);
      alert("Error al guardar los datos. Inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  // Cancelar edición
  const handleCancelar = () => {
    navigate(-1);
  };

  // Verificar si hay cambios
  const hayChanged = JSON.stringify(cliente) !== JSON.stringify(originalData);

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
              <button onClick={() => navigate(-1)} className="Newcustom">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
                <span>Volver</span>
              </button>
              <div className="flex items-center space-x-3">
                <div>
                  <h1 className="header-title">Editar Datos del Cliente</h1>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario */}

        <label className="input-label">
          <User className="w-4 h-4 inline mr-2" />
          Nombre del Cliente *
        </label>
        <input
          type="text"
          value={cliente.Cliente || ""}
          onChange={(e) => handleInputChange("Cliente", e.target.value)}
          className={`input-field ${
            errors.Cliente ? "input-error" : "input-field"
          }`}
          placeholder="Nombre completo del cliente"
        />

        {/* Email */}
        <div>
          <label className="input-label">
            <Mail className="w-4 h-4 inline mr-2" />
            Email *
          </label>
          <input
            type="email"
            value={cliente.email || ""}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className={`input-field ${
              errors.email ? "input-error" : "input-field"
            }`}
            placeholder="correo@ejemplo.com"
          />
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
              errors.telefono ? "input-error" : "input-field"
            }`}
            placeholder=" 666 123 456"
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
            value={cliente.Dirección || ""}
            onChange={(e) => handleInputChange("Dirección", e.target.value)}
            className={`input-field ${
              errors.Dirección ? "input-error" : "input-field"
            }`}
            placeholder="Calle, número, piso, puerta..."
          />
        </div>

        {/* Código Postal */}
        <div>
          <label className="input-label">
            <Code className="w-4 h-4 inline mr-2" />
            Código Postal *
          </label>
          <input
            type="text"
            value={cliente.CódigoPostal || ""}
            onChange={(e) => handleInputChange("CódigoPostal", e.target.value)}
            className={`input-field ${
              errors.CódigoPostal ? "input-error" : "input-field"
            }`}
            placeholder="28001"
            maxLength="5"
          />
        </div>

        {/* Población */}
        <div>
          <label className="input-label">
            <Building className="w-4 h-4 inline mr-2" />
            Población *
          </label>
          <input
            type="text"
            value={cliente.Población || ""}
            onChange={(e) => handleInputChange("Población", e.target.value)}
            className={`input-field ${
              errors.Población ? "input-error" : "input-field"
            }`}
            placeholder="Madrid"
          />
        </div>

        {/* Provincia */}
        <div className="md:col-span-2">
          <label className="input-label">
            <MapPin className="w-4 h-4 inline mr-2" />
            Provincia *
          </label>
          <input
            type="text"
            value={cliente.Provincia || ""}
            onChange={(e) => handleInputChange("Provincia", e.target.value)}
            className={`input-field ${
              errors.Provincia ? "input-error" : "input-field"
            }`}
            placeholder="Madrid"
          />
          {errors.Provincia && (
            <p className="mt-1 text-sm text-red-600">{errors.Provincia}</p>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t">
          <button
            onClick={handleCancelar}
            className="Newcustom"
            disabled={saving}
          >
            <span>Cancelar</span>
          </button>

          <button
            onClick={handleGuardar}
            disabled={saving || !hayChanged}
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

        {/* Indicador de cambios */}
        {hayChanged && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ Hay cambios sin guardar
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditarDatosCliente;
