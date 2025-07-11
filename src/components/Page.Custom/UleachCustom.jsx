import { NavLink } from "react-router";

function UleachCustom({ objListCustom, listBikes }) {
  return (
    <>
      <li className="listMotocicle">
        <p>Datos del cliente: </p>
        <p>Cliente: {objListCustom.Cliente}</p>
        <p>Email: {objListCustom.Email} </p>
        <p>Teléfono: {objListCustom.Teléfono}</p>
        <p>Dirección: {objListCustom.Dirección}</p>
        <p>CódigoPostal: {objListCustom.CódigoPostal}</p>
        <p>Población: {objListCustom.Población}</p>
        <p>Provincia: {objListCustom.Provincia}</p>
      </li>

      {/* Asegúrate de usar el campo correcto del ID del cliente */}
      <NavLink
        className="Newcustom"
        to={`/admin/motos/${objListCustom.id}`}
        state={{ listBikes }}
      >
        Ver tu motocicleta
      </NavLink>

      <NavLink className="Newcustom" to="/TechnicalDataCustomer">
        Datos suspensiones
      </NavLink>
    </>
  );
}

export default UleachCustom;
