import { useParams, useLocation } from "react-router";
import UleachBike from "./UleachBike";

function ListBike({ listBikes, listTechnical }) {
  const { id } = useParams();
  const location = useLocation();

  // Priorizar datos del state, luego las props
  const bikes = location.state?.listBikes || listBikes;
  const technical = location.state?.listTechnical || listTechnical;

  console.log("ListBike - Cliente ID:", id);
  console.log("ListBike - Bikes recibidos:", bikes);
  console.log("ListBike - Technical recibido:", technical);

  // Validaciones
  if (!bikes) {
    return <div>No hay datos de motocicletas disponibles</div>;
  }

  const motosArray = bikes?.motos || [];

  if (!Array.isArray(motosArray)) {
    console.error("motosArray no es un array:", motosArray);
    return (
      <div>Error: Los datos de motocicletas no tienen el formato correcto</div>
    );
  }

  if (motosArray.length === 0) {
    return <div>No hay motocicletas disponibles</div>;
  }

  // Filtrar motos del cliente específico
  const motosDelCliente = motosArray.filter((moto) => {
    const motoClienteId = String(moto.clienteId);
    const paramId = String(id);
    return motoClienteId === paramId;
  });

  console.log("Motos del cliente filtradas:", motosDelCliente);

  if (motosDelCliente.length === 0) {
    return (
      <div>
        <p>Este cliente no tiene motocicletas registradas</p>
      </div>
    );
  }

  return (
    <>
      <ul className="ulListBikes">
        <UleachBike
          listBikes={motosDelCliente} // Pasar solo las motos del cliente
          clientId={id}
          listTechnical={technical}
        />
      </ul>
    </>
  );
}

export default ListBike;
