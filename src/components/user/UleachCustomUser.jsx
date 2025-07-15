import { NavLink } from "react-router";

function UleachCustomUser({ Custom, listBikes }) {
  console.log("Renderizando componente:", Custom.Cliente);

  if (!Custom) {
    console.warn("UleachCustomUser recibió un 'Custom' indefinido o nulo.");
    return null;
  }

  const safeDisplay = (value) => value || "No disponible";

  // Verificar si el cliente tiene motos
  const motosDelCliente =
    listBikes?.motos?.filter((moto) => moto.clienteId === Custom.id) || [];

  const tieneMotos = motosDelCliente.length > 0;

  return (
    <>
      <li className="listMotocicle">
        <p>Cliente: {safeDisplay(Custom.Cliente)}</p>
        <p>Email: {safeDisplay(Custom.Email)}</p>
        <p>Teléfono: {safeDisplay(Custom.telefono)}</p>
        <p>Dirección: {safeDisplay(Custom.Dirección)}</p>
        <p>Código Postal: {safeDisplay(Custom.CódigoPostal)}</p>
        <p>Población: {safeDisplay(Custom.Población)}</p>
        <p>Provincia: {safeDisplay(Custom.Provincia)}</p>
      </li>

      {/* Mostrar enlace de motos o botón de crear */}
      {Custom.id &&
        (tieneMotos ? (
          <NavLink
            className="Newcustom"
            to={`/motos/${Custom.id}`}
            state={{ listBikes }}
          >
            Ver mis motocicletas ({motosDelCliente.length})
          </NavLink>
        ) : (
          <NavLink
            className="Newcustom create-moto-btn"
            to="/FormBike"
            state={{ clienteId: Custom.id, clienteData: Custom }}
          >
            Registrar mi motocicleta
          </NavLink>
        ))}

      <NavLink className="Newcustom" to="/formsCustom">
        Editar mis datos de cliente
      </NavLink>
    </>
  );
}

export default UleachCustomUser;
