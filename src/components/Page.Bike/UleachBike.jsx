function UleachBike({ objListBike }) {
  //objListBike es cada cliente del array dentro del componente list y para que lo pase por props creo

  return (
    <>
      <li className="listMotocicle">
        <p>Marca:{objListBike.marca} </p>
        <p>Modelo: {objListBike.modelo}</p>
        <p>Año de fabricacion: {objListBike.anoFabricacion} </p>
        <p>Matrícula: {objListBike.Matricula}</p>
      </li>
    </>
  );
}

export default UleachBike;
