import UleachBike from "./UleachBike";

function ListBike({ listBikes }) {
  // const handleInputEnrolment = (ev) => {
  // setFilterEnrolment(ev.target.value);
  //};

  return (
    <>
      <h3>DATOS MOTOCICLETA</h3>
      <ul className="ulListBikes">
        <UleachBike listBikes={listBikes} />
      </ul>
    </>
  );
}

export default ListBike;
