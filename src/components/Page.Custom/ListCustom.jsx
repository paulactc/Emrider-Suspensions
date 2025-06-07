import UleachBike from "../Page.Custom/UleachBike";

function ListCustom({ bikes }) {
  // const handleInputEnrolment = (ev) => {
  // setFilterEnrolment(ev.target.value);
  //};
  //me quedo por aquí, he escuchado al input y ahora estoy haciendo la funcion manejadora

  return (
    <>
      <h3>DATOS DE LA MOTOCICLETA</h3>
      <ul className="ulListBikes">
        {bikes.map((eachBike) => (
          <UleachBike objListBike={eachBike} key={eachBike.Cliente} />
        ))}
      </ul>
    </>
  );
}

export default ListCustom;
