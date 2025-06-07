function UleachBike({ objListBike }) {
  //objListBike es cada cliente del array dentro del componente list y para que lo pase por props creo

  return (
    <li className="listMotocicle">
      <p>Datos de la motocicleta: </p>
      <p>Marca:{objListBike.Marca} </p>
      <p>Modelo:{objListBike.Modelo} </p>
      <p>Año de fabricación: {objListBike.Añodefabricacion} </p>
      <p>Matrícula: {objListBike.Matricula} </p>

      <p>Cliente: {objListBike.Cliente}</p>
      <p>Email: {objListBike.Email} </p>
      <p>Teléfono: {objListBike.Teléfono}</p>
      <p>Dirección: {objListBike.Dirección}</p>
      <p>CódigoPostal: {objListBike.CódigoPostal}</p>
      <p>Población: {objListBike.Población}</p>
      <p>Provincia: {objListBike.Provincia}</p>
    </li>
  );
}

export default UleachBike;
