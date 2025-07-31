import { useParams, useLocation } from "react-router";
import { NavLink } from "react-router";
import UlEachDatesTechnical from "./UlEachDatesTechnical";
function TechnicalDataCustomer({ listTechnical }) {
  const { id } = useParams();
  const location = useLocation();
  const datetechnical = location.state?.listTechnical || listTechnical;

  // EXTRAER EL ARRAY DE DATOS TÉCNICOS DEL OBJETO
  const datetechnicalArray = datetechnical?.datostecnicos || [];
  if (!Array.isArray(datetechnicalArray) || datetechnicalArray.length === 0) {
    return <div>No hay datos técnicos dispobibles</div>;
  }

  return (
    <>
      <UlEachDatesTechnical
        datetechnicalArray={datetechnicalArray}
        motoId={id}
      />
    </>
  );
}

export default TechnicalDataCustomer;
