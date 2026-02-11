import { useState } from "react";
import logoEmrider from "/images/Logomonoemrider.jpeg";
import logoÖhlins from "/images/Logo.ohlins.png";
import logoKayaba from "/images/Kayaba.png";
import logoAndreani from "/images/AndreaniMHS.png";
import logoShowa from "/images/Showa.png";
import logoSkf from "/images/SKF.png";
import { NavLink } from "react-router";
import { useNavigate } from "react-router";
import api from "../../../services/Api";

function LandingPage(props) {
  const [login, setLogin] = useState({
    user: "",
    pass: "",
  });
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInput = (ev) => {
    const { name, value } = ev.target;
    setLogin({
      ...login,
      [name]: value,
    });
    setLoginError("");
  };
  const navigate = useNavigate();

  const handleAccess = async () => {
    setLoginError("");
    setLoading(true);

    if (!login.user || !login.pass) {
      setLoginError("Introduce usuario y clave");
      setLoading(false);
      return;
    }

    try {
      // Detectar si el usuario introduce un DNI/NIF o un email
      const isDni = /^[0-9]{7,8}[a-zA-Z]$/.test(login.user.trim());
      const result = isDni
        ? await api.loginWithDni(login.user.trim(), login.pass)
        : await api.login(login.user.trim(), login.pass);

      if (result.success) {
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("user", JSON.stringify(result.data.user));

        if (result.data.user.rol === "admin") {
          navigate("/admin/clientes");
        } else {
          navigate("/cliente");
        }
        window.scrollTo(0, 0);
        return;
      }

      setLoginError("Usuario o clave incorrectos");
    } catch (err) {
      console.error("Error en login:", err.message);
      setLoginError("Usuario o clave incorrectos");
    }

    setLoading(false);
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

      <form className="form-login-body" onSubmit={(e) => { e.preventDefault(); handleAccess(); }}>
        <h2 className="header-title">ACCESO</h2>
        <label className="input-label">Usuario:</label>
        <input
          className="input-field"
          name="user"
          value={login.user}
          onInput={handleInput}
          type="text"
          placeholder="DNI o email"
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
        {loginError && (
          <p style={{ color: "#f44336", margin: "0.5rem 0" }}>{loginError}</p>
        )}
        <button className="btngo" type="submit" disabled={loading}>
          {loading ? "Accediendo..." : "Acceso"}
        </button>
        <NavLink className="btngo" to="/nuevo-usuario">
          Nueva cuenta
        </NavLink>
        <NavLink to="/forgot-password" style={{ color: "#e53935", textDecoration: "none", fontSize: "0.9rem", marginTop: "0.5rem", display: "inline-block" }}>
          ¿Olvidaste tu contraseña?
        </NavLink>
      </form>
    </div>
  );
}

export default LandingPage;
