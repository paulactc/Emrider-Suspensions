import { NavLink } from "react-router";

function UleachCustom({ eachCustom, listBikes }) {
  // --- LOG DE DEPURACIÓN 5 ---
  console.log("5. eachCustom en UleachCustom (al inicio):", eachCustom);

  // Validación defensiva mejorada
  if (!eachCustom) {
    console.warn(
      "UleachCustom recibió un 'eachCustom' indefinido o nulo. No se renderizará."
    );
    return null;
  }

  // Validación de campos críticos
  if (!eachCustom.Cliente) {
    console.warn("UleachCustom recibió un cliente sin nombre:", eachCustom);
    return null;
  }

  // Función helper para mostrar datos seguros
  const safeDisplay = (value) => value || "No disponible";

  return (
    <>
      <li className="listMotocicle">
        <p>Datos del cliente: </p>
        <p>Cliente: {safeDisplay(eachCustom.Cliente)}</p>
        <p>Email: {safeDisplay(eachCustom.Email)}</p>
        <p>
          Teléfono: {safeDisplay(eachCustom.telefono || eachCustom.telefono)}
        </p>
        <p>Dirección: {safeDisplay(eachCustom.Dirección)}</p>
        <p>Código Postal: {safeDisplay(eachCustom.CódigoPostal)}</p>
        <p>Población: {safeDisplay(eachCustom.Población)}</p>
        <p>Provincia: {safeDisplay(eachCustom.Provincia)}</p>
      </li>

      {/* Solo mostrar el enlace si hay un ID válido */}
      {eachCustom.id && (
        <NavLink
          className="Newcustom"
          to={`/admin/motos/${eachCustom.id}`}
          state={{ listBikes }}
        >
          Ver tu motocicleta
        </NavLink>
      )}

      <NavLink className="Newcustom" to="/formsCustom">
        Agrega tus datos de cliente
      </NavLink>
    </>
  );
}
export default UleachCustom;
