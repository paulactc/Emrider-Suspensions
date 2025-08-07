import { useState } from "react";
import logoEmrider from "/images/Logomonoemrider.jpeg";
import logoÖhlins from "/images/Logo.ohlins.png";
import logoKayaba from "/images/Kayaba.png";
import logoAndreani from "/images/AndreaniMHS.png";
import logoShowa from "/images/Showa.png";
import logoSkf from "/images/SKF.png";
import { NavLink } from "react-router";

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

        <div className="brand-list">
          <div className="wrapper">
            <img className="ohlins" src={logoÖhlins} alt="Öhlins Logo" />
            <img src={logoKayaba} alt="Kayaba Logo" />
            <img src={logoSkf} alt="Skf Logo" />
            <img src={logoShowa} alt="Showa Logo" />
            <img src={logoAndreani} alt="Andreani Logo" />
            <img className="ohlins" src={logoÖhlins} alt="Öhlins Logo" />
            <img src={logoKayaba} alt="Kayaba Logo" />
            <img src={logoSkf} alt="Skf Logo" />
            <img src={logoShowa} alt="Showa Logo" />
            <img src={logoAndreani} alt="Andreani Logo" />
          </div>
        </div>
        <div className="contenedor-text">
          <p className="parra">
            Consulta de forma exclusiva tu historial técnico de suspensiones{" "}
            <br />
            Solo para clientes Emrider.
            <br />
            <br />
            <span className="highlight-text">
              Regístrate y llévala siempre contigo.
            </span>
          </p>
        </div>
      </div>

      <section className="form-login-body">
        <h2 className="header-title">ACCESO</h2>
        <label className="input-label">Usuario:</label>
        <input
          className="input-field"
          name="user"
          value={login.user}
          onInput={handleInput}
          type="text"
          placeholder="ejemplo@emrider.es"
        />
        <label className="input-label">Clave:</label>
        <input
          className="input-field"
          name="pass"
          value={login.pass}
          onInput={handleInput}
          type="password"
          placeholder="••••••••"
        />
        <button className="btngo" onClick={handleAccess}>
          Acceso
        </button>
        <NavLink className="btngo" to="/nuevo-usuario">
          Nueva cuenta
        </NavLink>
      </section>
    </div>
  );
}

export default LandingPage;
