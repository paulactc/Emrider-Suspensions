import InputSearchCustom from "../admin/forms/InputSearchCustom";
import UleachCustom from "../Page.Custom/UleachCustom";

function ListCustom({ Custom, handleInputFilter, filters, listBikes }) {
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
            eachCustom={eachCustom}
            key={eachCustom.id}
            listBikes={listBikes}
          />
        ))}
      </ul>
    </>
  );
}

export default ListCustom;
