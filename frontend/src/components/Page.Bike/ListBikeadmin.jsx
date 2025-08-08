import { useParams, useLocation } from "react-router";
import UleachBikeAdmin from "./UleachBikeAdmin";

function ListBikeadmin({ listBikes, listTechnical }) {
  // ✅ Recibir listTechnical
  const { id } = useParams();
  const location = useLocation();
  const bikes = location.state?.listBikes || listBikes;

  const motosArray = bikes?.motos || [];
  if (!Array.isArray(motosArray) || motosArray.length === 0) {
    return <div>No hay motocicletas disponibles</div>;
  }

  return (
    <>
      <h3>DATOS MOTOCICLETA</h3>
      <ul className="ulListBikes">
        <UleachBikeAdmin
          listBikes={motosArray}
          clientId={id}
          listTechnical={listTechnical} // ✅ Pasar listTechnical
        />
      </ul>
    </>
  );
}

export default ListBikeadmin;
