import { NavLink } from "react-router";

function UleachCustom({ eachCustom, listBikes }) {
  console.log("eachCustom en UleachCustom:", eachCustom);
  return (
    <>
      <li className="listMotocicle">
        <p>Datos del cliente: </p>
        <p>Cliente: {eachCustom.Cliente}</p>
        <p>Email: {eachCustom.Email} </p>
        <p>Teléfono: {eachCustom.telefono}</p>
        <p>Dirección: {eachCustom.Dirección}</p>
        <p>CódigoPostal: {eachCustom.CódigoPostal}</p>
        <p>Población: {eachCustom.Población}</p>
        <p>Provincia: {eachCustom.Provincia}</p>
      </li>

      <NavLink
        className="Newcustom"
        to={`/admin/motos/${eachCustom.id}`}
        state={{ listBikes }}
      >
        Ver tu motocicleta
      </NavLink>

      <NavLink className="Newcustom" to="/formsCustom">
        Agrega tus datos de cliente
      </NavLink>
    </>
  );
}

export default UleachCustom;
