import { useParams, useLocation } from "react-router";

function UleachBike() {
  const { id } = useParams();
  const location = useLocation();
  const listBikes = location.state?.listBikes || [];

  if (!Array.isArray(listBikes) || listBikes.length === 0) {
    return <div>No hay motocicletas disponibles</div>;
  }

  const clientBikes = listBikes.filter(
    (bike) => bike.cliente_id === parseInt(id)
  );

  if (clientBikes.length === 0) {
    return <div>No se encontraron motocicletas para este cliente</div>;
  }

  return (
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
  );
}

export default UleachBike;
