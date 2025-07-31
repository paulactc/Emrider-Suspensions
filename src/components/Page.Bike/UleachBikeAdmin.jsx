import { NavLink } from "react-router";

function UleachBikeAdmin({ listBikes, clientId, listTechnical }) {
  // ✅ Recibir listTechnical
  if (!Array.isArray(listBikes) || listBikes.length === 0) {
    return <div>No hay motocicletas disponibles</div>;
  }

  // Filtrar las motocicletas por el clienteId proporcionado
  const clientBikes = listBikes.filter(
    (bike) => bike.clienteId === parseInt(clientId)
  );

  if (clientBikes.length === 0) {
    return <div>No se encontraron motocicletas para este cliente</div>;
  }

  return (
    <ul>
      {clientBikes.map((bike) => (
        <li key={bike.id} className="listclient">
          <p className="datos-cliente">Marca: {bike.marca}</p>
          <p className="datos-cliente">Modelo: {bike.modelo}</p>
          <p className="datos-cliente">
            Año de fabricación: {bike.anoFabricacion}
          </p>
          <p className="datos-cliente">Matrícula: {bike.Matricula}</p>

          <NavLink
            className="Newcustom"
            to={`/admin/datos-tecnicos-admin/${bike.id}`}
            state={{ listTechnical }}
          >
            Ver datos técnicos
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

export default UleachBikeAdmin;
