import { useState } from "react";
import { NavLink } from "react-router";
import api from "../../../services/Api";

function ForgotPassword() {
  const [emailOrDni, setEmailOrDni] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!emailOrDni.trim()) {
      setError("Introduce tu email o DNI");
      return;
    }

    setLoading(true);
    try {
      const result = await api.forgotPassword(emailOrDni.trim());
      if (result.success) {
        setMessage(result.message);
        setSent(true);
      }
    } catch (err) {
      setMessage("Si el email/DNI existe en nuestro sistema, se ha enviado un enlace de recuperacion");
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="offpage">
      <form className="form-login-body" onSubmit={handleSubmit}>
        <h2 className="header-title">RECUPERAR CONTRASEÑA</h2>

        {!sent ? (
          <>
            <p style={{ color: "#555", fontSize: "0.9rem", marginBottom: "1rem", textAlign: "center" }}>
              Introduce tu email o DNI y te enviaremos un enlace para restablecer tu contraseña.
            </p>
            <label className="input-label">Email o DNI:</label>
            <input
              className="input-field"
              type="text"
              value={emailOrDni}
              onChange={(e) => { setEmailOrDni(e.target.value); setError(""); }}
              placeholder="tu@email.com o 12345678A"
            />
            {error && (
              <p style={{ color: "#f44336", margin: "0.5rem 0" }}>{error}</p>
            )}
            <button className="btngo" type="submit" disabled={loading}>
              {loading ? "Enviando..." : "Enviar enlace"}
            </button>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <p style={{ color: "#4caf50", fontWeight: "bold", marginBottom: "1rem" }}>
              {message}
            </p>
            <p style={{ color: "#555", fontSize: "0.9rem" }}>
              Revisa tu bandeja de entrada (y la carpeta de spam).
            </p>
          </div>
        )}

        <NavLink to="/" style={{ color: "#e53935", textDecoration: "none", fontSize: "0.9rem", marginTop: "1rem", display: "inline-block" }}>
          Volver al login
        </NavLink>
      </form>
    </div>
  );
}

export default ForgotPassword;
