function InputSearchCustom({ handleInputFilter, filters }) {
  return (
    <>
      <form className="filters">
        <label htmlFor="filterCustom">Busqueda de cliente</label>
        <input
          id="Cliente"
          type="text"
          name="filterName"
          onInput={handleInputFilter}
          value={filters.Cliente}
        ></input>

        <label htmlFor="filterEnrolment">matricula de motocicleta</label>
        <input
          id="Matricula"
          name="filterEnrolment"
          type="text"
          onInput={handleInputFilter}
          value={filters.Matricula}
        ></input>
      </form>
    </>
  );
}

export default InputSearchCustom;
