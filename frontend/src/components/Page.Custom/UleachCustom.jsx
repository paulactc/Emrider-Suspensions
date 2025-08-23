import { NavLink } from "react-router";
import { Edit3 } from "lucide-react";
import { useNavigate } from "react-router";
import React, { useEffect, useState } from "react";
import api from "../../../services/Api"; // Asegúrate de que la ruta sea correcta

function UleachCustom({ eachCustom, listBikes, listTechnical }) {
  console.log("5. eachCustom en UleachCustom (al inicio):", eachCustom);

  const navigate = useNavigate();
  const [motos, setMotos] = useState([]);
  const [loadingMotos, setLoadingMotos] = useState(false);

  // Efecto para cargar las motos por CIF (igual que en UleachCustomUser)
  useEffect(() => {
    if (!eachCustom?.cif) return;

    const cargarMotos = async () => {
      try {
        setLoadingMotos(true);
        const motosData = await api.getMotosByCif(eachCustom.cif);
        setMotos(Array.isArray(motosData) ? motosData : []);
      } catch (err) {
        console.error("Error cargando motos por CIF:", err);
        setMotos([]);
      } finally {
        setLoadingMotos(false);
      }
    };

    cargarMotos();
  }, [eachCustom?.cif]);

  const handleEditarCliente = (cliente) => {
    navigate(`/editar-cliente/${cliente.id}`, {
      state: { clientData: cliente },
    });
  };

  if (!eachCustom) {
    console.warn("UleachCustom recibió un 'eachCustom' indefinido o nulo.");
    return null;
  }

  if (!eachCustom.nombre && !eachCustom.apellidos) {
    console.warn("UleachCustom sin nombre ni apellidos:", eachCustom);
    return null;
  }

  const safeDisplay = (value) => value || "No disponible";

  // Usar las motos cargadas por CIF
  const tieneMotos = motos.length > 0;

  return (
    <>
      <li className="listclient">
        <button
          onClick={() => handleEditarCliente(eachCustom)}
          className="Newcustom"
        >
          <Edit3 />
          Editar
        </button>
        <p className="datos-cliente">
          Cliente:{" "}
          {safeDisplay(
            `${eachCustom.nombre || ""} ${eachCustom.apellidos || ""}`.trim()
          )}
        </p>

        <p className="datos-cliente">
          Teléfono: {safeDisplay(eachCustom.telefono)}
        </p>
        <p className="datos-cliente">CIF: {safeDisplay(eachCustom.cif)}</p>
        <p className="datos-cliente">
          Dirección: {safeDisplay(eachCustom.direccion)}
        </p>
        <p className="datos-cliente">
          Código Postal: {safeDisplay(eachCustom.codigo_postal)}
        </p>
        <p className="datos-cliente">
          Población: {safeDisplay(eachCustom.poblacion)}
        </p>
        <p className="datos-cliente">
          Provincia: {safeDisplay(eachCustom.provincia)}
        </p>

        {/* Mostrar datos de moto o botón de crear */}
        {eachCustom.id && (
          <div className="moto-actions">
            {loadingMotos ? (
              <p className="loading-message">Cargando motocicletas...</p>
            ) : tieneMotos ? (
              <div className="tiene-motos">
                <NavLink
                  className="Newcustom"
                  to={`/admin/motosadmin/${eachCustom.id}`}
                  state={{
                    motos: motos, // Pasar las motos cargadas
                    cif: eachCustom.cif, // Pasar el CIF
                    listTechnical,
                  }}
                >
                  Ver motocicletas ({motos.length})
                </NavLink>
                <NavLink
                  className="Newcustom create-moto-btn"
                  to="/FormBike"
                  state={{
                    clienteId: eachCustom.id,
                    clientData: eachCustom,
                    listTechnical,
                  }}
                >
                  Crear motocicleta
                </NavLink>
              </div>
            ) : (
              <div className="no-motos">
                <p className="no-results-message">
                  No tiene motocicletas registradas
                </p>
                <NavLink
                  className="Newcustom create-moto-btn"
                  to="/FormBike"
                  state={{
                    clienteId: eachCustom.id,
                    clientData: eachCustom,
                    listTechnical,
                  }}
                >
                  crear motocicleta
                </NavLink>
              </div>
            )}
          </div>
        )}
      </li>
    </>
  );
}

export default UleachCustom;
