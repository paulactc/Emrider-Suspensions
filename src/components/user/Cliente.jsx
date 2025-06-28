import UleachCustom from "../Page.Custom/UleachCustom";

function Cliente({ Custom }) {
  // const handleInputEnrolment = (ev) => {
  // setFilterEnrolment(ev.target.value);
  //};
  //me quedo por aquí, he escuchado al input y ahora estoy haciendo la funcion manejadora

  return (
    <>
      <h3>TUS DATOS DE CLIENTE</h3>
      <ul className="ulListBikes">
        <UleachCustom objListCustom={Custom[0]} />
      </ul>
    </>
  );
}

export default Cliente;
