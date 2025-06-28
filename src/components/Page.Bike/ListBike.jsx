import UleachBike from "./UleachBike";

function ListBike({ Custom }) {
  // const handleInputEnrolment = (ev) => {
  // setFilterEnrolment(ev.target.value);
  //};
  //me quedo por aquí, he escuchado al input y ahora estoy haciendo la funcion manejadora

  return (
    <>
      <h3>DATOS MOTOCICLETA</h3>
      <ul className="ulListBikes">
        {Custom.map((eachBike) => (
          <UleachBike objListCustom={eachBike} key={eachBike.Id} />
        ))}
      </ul>
    </>
  );
}

export default ListBike;
