import { NavLink } from "react-router";
import React, { useEffect, useState } from "react";
import api from "../../../services/Api";

function UleachCustom({ eachCustom, listBikes, listTechnical }) {
  const [motos, setMotos] = useState([]);
  const [loadingMotos, setLoadingMotos] = useState(false);

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

  if (!eachCustom) {
    return null;
  }

  if (!eachCustom.nombre && !eachCustom.apellidos && !eachCustom.nombre_completo) {
    return null;
  }

  const safeDisplay = (value) => value || "No disponible";
  const tieneMotos = motos.length > 0;

  return (
    <>
      <li className="listclient">
        <div className="cliente-header">
          <img
            src="/images/Logomonoemrider.jpeg"
            alt="EmRider"
            className="cliente-logo"
          />
          <p className="datos-cliente">
            Cliente:{" "}
            {safeDisplay(
              eachCustom.nombre_completo
              || `${eachCustom.nombre || ""} ${eachCustom.apellidos || ""}`.trim()
            )}
          </p>
        </div>

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

        {eachCustom.id && (
          <div className="moto-actions">
            {loadingMotos ? (
              <p className="loading-message">Cargando motocicletas...</p>
            ) : tieneMotos ? (
              <NavLink
                className="Newcustom"
                to={`/admin/motosadmin/${eachCustom.id}`}
                state={{
                  motos: motos,
                  cif: eachCustom.cif,
                  listTechnical,
                }}
              >
                Ver motocicletas ({motos.length})
              </NavLink>
            ) : (
              <p className="no-results-message">
                No tiene motocicletas registradas
              </p>
            )}
          </div>
        )}
      </li>
    </>
  );
}

export default UleachCustom;
