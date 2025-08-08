import { NavLink } from "react-router";
import { Edit3 } from "lucide-react";
import { useNavigate } from "react-router";

function UleachCustom({ eachCustom, listBikes, listTechnical }) {
  console.log("5. eachCustom en UleachCustom (al inicio):", eachCustom);

  const navigate = useNavigate();

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

  // ✅ CORRECCIÓN: Solo filtrar por clienteId
  const motosDelCliente =
    listBikes?.motos?.filter((moto) => moto.clienteId === eachCustom.id) || [];

  const tieneMotos = motosDelCliente.length > 0;

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
            {tieneMotos ? (
              <div className="tiene-motos">
                <NavLink
                  className="Newcustom"
                  to={`/admin/motosadmin/${eachCustom.id}`}
                  state={{ listBikes, listTechnical }}
                >
                  Ver motocicletas ({motosDelCliente.length})
                </NavLink>
              </div>
            ) : (
              <div className="no-motos">
                <p className="no-results-message">
                  No tiene motocicletas registradas
                </p>
                <NavLink
                  className="Newcustom create-moto-btn"
                  to="/formBike"
                  state={{
                    clienteId: eachCustom.id,
                    clientData: eachCustom,
                    listTechnical,
                  }}
                >
                  Registrar motocicleta
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
