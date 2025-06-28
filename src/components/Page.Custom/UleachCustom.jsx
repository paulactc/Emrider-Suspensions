import { NavLink } from "react-router";
function UleachCustom({ objListCustom }) {
  //objListBike es cada cliente del array dentro del componente list y para que lo pase por props creo

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
      <NavLink
        className="Newcustom"
        to={`/admin/motos/${objListCustom?.id || ""}`}
      >
        Listar motocicletas
      </NavLink>
      <NavLink className="Newcustom" to={`/admin/motos${objListCustom.id}`}>
        Listar motocicletas
      </NavLink>

      <NavLink className="Newcustom" to={`/admin/motos/${objListCustom.id}`}>
        Listar motocicletas
      </NavLink>

      <NavLink className="Newcustom" to="/FormBike">
        Crear datos motocicleta
      </NavLink>
      <NavLink className="Newcustom" to="/TechnicalDataCustomer">
        Datos suspensiones
      </NavLink>
    </>
  );
}

export default UleachCustom;
