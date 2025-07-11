import { NavLink } from "react-router";
function UleachBike({ listBikes, clientId }) {
  if (!Array.isArray(listBikes) || listBikes.length === 0) {
    return <div>No hay motocicletas disponibles</div>;
  }

  // CAMBIAR cliente_id por clienteId
  const clientBikes = listBikes.filter(
    (bike) => bike.clienteId === parseInt(clientId)
  );

  if (clientBikes.length === 0) {
    return <div>No se encontraron motocicletas para este cliente</div>;
  }

  return (
    <>
      <ul>
        {clientBikes.map((bike) => (
          <li key={bike.id} className="listMotocicle">
            <p>Marca: {bike.marca}</p>
            <p>Modelo: {bike.modelo}</p>
            <p>Año de fabricación: {bike.anoFabricacion}</p>
            <p>Matrícula: {bike.Matricula}</p>
          </li>
        ))}
      </ul>

      <NavLink className="Newcustom" to="/TechnicalDataCustomer">
        Datos suspensiones
      </NavLink>
    </>
  );
}
export default UleachBike;
