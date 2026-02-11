import { useState } from "react";
import { useParams, NavLink } from "react-router";
import api from "../../../services/Api";

function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!password || !confirmPassword) {
      setError("Rellena ambos campos");
      return;
    }

    if (password.length < 4) {
      setError("La contraseña debe tener al menos 4 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      const result = await api.resetPassword(token, password);
      if (result.success) {
        setSuccess(true);
      }
    } catch (err) {
      setError("El enlace no es valido o ha expirado. Solicita uno nuevo.");
    }
    setLoading(false);
  };

  return (
    <div className="offpage">
      <form className="form-login-body" onSubmit={handleSubmit}>
        <h2 className="header-title">NUEVA CONTRASEÑA</h2>

        {!success ? (
          <>
            <p style={{ color: "#555", fontSize: "0.9rem", marginBottom: "1rem", textAlign: "center" }}>
              Introduce tu nueva contraseña.
            </p>
            <label className="input-label">Nueva contraseña:</label>
            <input
              className="input-field"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder="••••••••"
            />
            <label className="input-label">Confirmar contraseña:</label>
            <input
              className="input-field"
              type="password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
              placeholder="••••••••"
            />
            {error && (
              <p style={{ color: "#f44336", margin: "0.5rem 0" }}>{error}</p>
            )}
            <button className="btngo" type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Cambiar contraseña"}
            </button>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <p style={{ color: "#4caf50", fontWeight: "bold", marginBottom: "1rem" }}>
              Contraseña actualizada correctamente
            </p>
            <NavLink className="btngo" to="/" style={{ display: "inline-block", textAlign: "center" }}>
              Ir al login
            </NavLink>
          </div>
        )}
      </form>
    </div>
  );
}

export default ResetPassword;
