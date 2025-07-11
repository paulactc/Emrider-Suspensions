function FormNewUser() {
  return (
    <>
      <form className="addForm">
        <h2 className="title">Nuevo usuario</h2>
        <legend className="addForm__title">correo electronico:</legend>
        <input
          className="addForm__input"
          type="email"
          name="email"
          id="email"
          placeholder="ejemplo@gmail.com"
          // ← CONECTA con el estado
          // ← CONECTA con la función
        />
        <legend className="addForm__title">contraseña:</legend>
        <input type="password" name="password" />
        <legend className="addForm__title">repite contraseña:</legend>
        <input type="password" name="repeatPassword" />
        <button className="Newcustom" type="submit">
          Crear Usuario
        </button>
      </form>
    </>
  );
}

export default FormNewUser;
