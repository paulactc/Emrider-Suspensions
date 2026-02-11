import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import {
  User,
  Phone,
  MapPin,
  Code,
  Building,
  ArrowLeft,
  FileUser,
  Lock,
} from "lucide-react";

const EditarDatosCliente = ({ listCustom = [] }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

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

  useEffect(() => {
    const cargarDatosCliente = async () => {
      setLoading(true);
      try {
        let clienteData = null;

        if (location.state?.clienteData || location.state?.clientData) {
          clienteData = location.state.clienteData || location.state.clientData;
        } else if (listCustom && listCustom.length > 0) {
          clienteData = listCustom.find((c) => String(c.id) === String(id));
        }

        if (!clienteData) {
          throw new Error("Cliente no encontrado");
        }

        const clienteNormalizado = {
          id: clienteData.id || "",
          nombre: clienteData.nombre || "",
          apellidos: clienteData.apellidos || "",
          telefono: clienteData.telefono || "",
          direccion: clienteData.direccion || "",
          codigo_postal: clienteData.codigo_postal || "",
          poblacion: clienteData.poblacion || clienteData.localidad || "",
          provincia: clienteData.provincia || "",
          cif: clienteData.cif || "",
        };

        setCliente(clienteNormalizado);
      } catch (error) {
        console.error("Error cargando cliente:", error);
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

  const handleCancelar = () => {
    navigate(-1);
  };

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
                <Lock className="w-8 h-8 text-gray-500" />
                <div>
                  <h1 className="header-title">Datos del Cliente</h1>
                  <p className="text-gray-600">
                    {cliente.nombre} {cliente.apellidos}
                  </p>
                  <p className="text-sm text-gray-400">
                    Datos gestionados desde GDTaller (solo lectura)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Datos en modo solo lectura */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Los datos del cliente se gestionan desde GDTaller y no se pueden editar desde aqui.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div>
              <label className="input-label">
                <User className="w-4 h-4 inline mr-2" />
                Nombre
              </label>
              <input
                type="text"
                value={cliente.nombre || ""}
                className="input-field"
                disabled
              />
            </div>

            {/* Apellidos */}
            <div>
              <label className="input-label">
                <User className="w-4 h-4 inline mr-2" />
                Apellidos
              </label>
              <input
                type="text"
                value={cliente.apellidos || ""}
                className="input-field"
                disabled
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="input-label">
                <Phone className="w-4 h-4 inline mr-2" />
                Telefono
              </label>
              <input
                type="tel"
                value={cliente.telefono || ""}
                className="input-field"
                disabled
              />
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
                className="input-field"
                disabled
              />
            </div>

            {/* Dirección */}
            <div className="md:col-span-2">
              <label className="input-label">
                <MapPin className="w-4 h-4 inline mr-2" />
                Direccion
              </label>
              <input
                type="text"
                value={cliente.direccion || ""}
                className="input-field"
                disabled
              />
            </div>

            {/* Código Postal */}
            <div>
              <label className="input-label">
                <Code className="w-4 h-4 inline mr-2" />
                Codigo Postal
              </label>
              <input
                type="text"
                value={cliente.codigo_postal || ""}
                className="input-field"
                disabled
              />
            </div>

            {/* Población */}
            <div>
              <label className="input-label">
                <Building className="w-4 h-4 inline mr-2" />
                Poblacion
              </label>
              <input
                type="text"
                value={cliente.poblacion || ""}
                className="input-field"
                disabled
              />
            </div>

            {/* Provincia */}
            <div className="md:col-span-2">
              <label className="input-label">
                <MapPin className="w-4 h-4 inline mr-2" />
                Provincia
              </label>
              <input
                type="text"
                value={cliente.provincia || ""}
                className="input-field"
                disabled
              />
            </div>
          </div>

          {/* Botón volver */}
          <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t">
            <button
              onClick={handleCancelar}
              className="Newcustom"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditarDatosCliente;
