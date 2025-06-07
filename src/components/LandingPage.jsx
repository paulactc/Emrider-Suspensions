import logoEmrider from "../images/Logomonoemrider.jpeg";

function LandingPage(props) {
  return (
    <div className="offpage">
      <section className="bigsection">
        <img className="imglog" src={logoEmrider} alt="icon" />
        <h1 className="title">Emrider Suspensions</h1>
      </section>

      <div className="sectmedium">
        <h3>Accede a tu historial técnico exclusivo con Emrider</h3>
        <p className="parra">
          Consulta de forma privada todos los trabajos realizados en tus
          suspensiones <br />
          Información precisa, solo para clientes Emrider. Regístrate y llévala
          siempre contigo.
        </p>
      </div>

      <section className="conticon">
        <label>Usuario:</label>
        <input className="user" type="text" />
        <label>Clave:</label>
        <input className="user" type="text" />
        <a
          href="./formulary.html"
          className="btngo"
          onClick={props.handleButton}
        >
          Acceso
        </a>
      </section>
    </div>
  );
}

export default LandingPage;
