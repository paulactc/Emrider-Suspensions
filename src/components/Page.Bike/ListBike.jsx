import { useParams, useLocation } from "react-router";
import UleachBike from "./UleachBike";

function ListBike({ listBikes }) {
  const { id } = useParams();
  const location = useLocation();
  const bikes = location.state?.listBikes || listBikes;

  // EXTRAER EL ARRAY DE MOTOS DEL OBJETO
  const motosArray = bikes?.motos || [];
  if (!Array.isArray(motosArray) || motosArray.length === 0) {
    return <div>No hay motocicletas disponibles</div>;
  }

  return (
    <>
      <h3>DATOS MOTOCICLETA</h3>
      <ul className="ulListBikes">
        <UleachBike listBikes={motosArray} clientId={id} />
      </ul>
    </>
  );
}

export default ListBike;
