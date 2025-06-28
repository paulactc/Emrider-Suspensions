import { NavLink } from "react-router";
function InputSearchCustom({ handleInputFilter, filters }) {
  return (
    <>
      <section className="filters">
        <form className="inputs">
          <div className="field-container">
            <label htmlFor="Cliente">Búsqueda de cliente</label>
            <input
              id="Cliente"
              type="text"
              name="filterName"
              onInput={handleInputFilter}
              value={filters.Cliente}
              placeholder="Introduce nombre del cliente..."
            />
          </div>

          <div className="field-container">
            <label htmlFor="telefono">Teléfono</label>
            <input
              id="telefono"
              name="filterEnrolment"
              type="number"
              onInput={handleInputFilter}
              value={filters.telefono}
              placeholder="Ej: 689875855"
            />
          </div>
        </form>
        <NavLink className="Newcustom" to="/formsCustom">
          Crear nuevo cliente
        </NavLink>
      </section>
    </>
  );
}

export default InputSearchCustom;
