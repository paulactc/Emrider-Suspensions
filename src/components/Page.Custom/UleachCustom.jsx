import { NavLink } from "react-router";

function UleachCustom({ eachCustom, listBikes }) {
  console.log("5. eachCustom en UleachCustom (al inicio):", eachCustom);

  if (!eachCustom) {
    console.warn("UleachCustom recibió un 'eachCustom' indefinido o nulo.");
    return null;
  }

  if (!eachCustom.Cliente) {
    console.warn("UleachCustom recibió un cliente sin nombre:", eachCustom);
    return null;
  }

  const safeDisplay = (value) => value || "No disponible";

  // ✅ CORRECCIÓN: Solo filtrar por clienteId
  const motosDelCliente =
    listBikes?.motos?.filter((moto) => moto.clienteId === eachCustom.id) || [];

  const tieneMotos = motosDelCliente.length > 0;

  // 🔍 LOG PARA DEPURACIÓN
  console.log("Cliente ID:", eachCustom.id);
  console.log("Cliente Nombre:", eachCustom.Cliente);
  console.log("Motos disponibles:", listBikes?.motos);
  console.log("Motos del cliente filtradas:", motosDelCliente);

  return (
    <>
      <li className="listMotocicle">
        <p>Datos del cliente: </p>
        <p>Cliente: {safeDisplay(eachCustom.Cliente)}</p>
        <p>Email: {safeDisplay(eachCustom.Email)}</p>
        <p>Teléfono: {safeDisplay(eachCustom.telefono)}</p>
        <p>Dirección: {safeDisplay(eachCustom.Dirección)}</p>
        <p>Código Postal: {safeDisplay(eachCustom.CódigoPostal)}</p>
        <p>Población: {safeDisplay(eachCustom.Población)}</p>
        <p>Provincia: {safeDisplay(eachCustom.Provincia)}</p>
      </li>

      {/* Mostrar datos de moto o botón de crear */}
      {eachCustom.id && (
        <div className="moto-actions">
          {tieneMotos ? (
            <div className="tiene-motos">
              <NavLink
                className="Newcustom"
                to={`/motos/${eachCustom.id}`}
                state={{ listBikes }}
              >
                Ver mis motocicletas ({motosDelCliente.length})
              </NavLink>
            </div>
          ) : (
            <div className="no-motos">
              <p>No tienes motocicletas registradas</p>
              <NavLink
                className="Newcustom create-moto-btn"
                to="/formsBike"
                state={{ clienteId: eachCustom.id, clienteData: eachCustom }}
              >
                Registrar mi motocicleta
              </NavLink>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default UleachCustom;
