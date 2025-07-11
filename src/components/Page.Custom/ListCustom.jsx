import InputSearchCustom from "../admin/forms/InputSearchCustom";
import UleachCustom from "../Page.Custom/UleachCustom";

function ListCustom({ Custom, handleInputFilter, filters, listBikes }) {
  // const handleInputEnrolment = (ev) => {
  // setFilterEnrolment(ev.target.value);
  //};
  //me quedo por aquí, he escuchado al input y ahora estoy haciendo la funcion manejadora

  return (
    <>
      <InputSearchCustom
        handleInputFilter={handleInputFilter}
        filters={filters}
      />
      <h3>DATOS CLIENTE</h3>
      <ul className="ulListBikes">
        {Custom.map((eachCustom) => (
          <UleachCustom
            objListCustom={eachCustom}
            key={eachCustom.Cliente}
            listBikes={listBikes}
          />
        ))}
      </ul>
    </>
  );
}

export default ListCustom;
