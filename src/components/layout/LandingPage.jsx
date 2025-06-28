import { useState } from "react";
import logoEmrider from "../../images/Logomonoemrider.jpeg";

import { useNavigate } from "react-router";
function LandingPage(props) {
  const [login, setLogin] = useState({
    user: "",
    pass: "",
  });
  const handleInput = (ev) => {
    const { name, value } = ev.target;

    setLogin({
      ...login,
      [name]: value,
    });
  };
  const navigate = useNavigate();

  const handleAccess = () => {
    if (login.user === "paula" && login.pass === "pass") {
      // Es admin
      console.log("Navigating to /list");
      props.handleButton(); // ← Sin pasar evento
      navigate("/admin/clientes");
      window.scrollTo(0, 0);
    } else {
      console.log("Navigating to /list");
      props.handleButton(); // ← Sin pasar evento
      navigate("/cliente");
      window.scrollTo(0, 0);
    }
  };
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
        <input
          className="user"
          name="user"
          value={login.user}
          onInput={handleInput}
          type="text"
        />
        <label>Clave:</label>
        <input
          className="user"
          name="pass"
          value={login.pass}
          onInput={handleInput}
          type="text"
        />
        <button className="btngo" onClick={handleAccess}>
          Acceso
        </button>
      </section>
    </div>
  );
}

export default LandingPage;
