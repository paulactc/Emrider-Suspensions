function InputSearchCustom({ handleInputFilter, filters }) {
  return (
    <>
      <section className="filters">
        <form className="inputs">
          <div className="field-container">
            <label htmlFor="Cliente">Búsqueda de cliente</label>
            <input
              className="input-field"
              id="Nombre"
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
              className="input-field"
              id="telefono"
              name="filterEnrolment"
              type="text"
              onInput={handleInputFilter}
              value={filters.telefono}
              placeholder="Ej: 689875855"
            />
          </div>
        </form>
      </section>
    </>
  );
}

export default InputSearchCustom;
