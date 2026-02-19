import React, { useState } from "react";
import { useNavigate } from "react-router";
import api from "../../../services/Api";

function FormNewUser() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const dniRegex = /^[0-9]{8}[A-Z]$/;

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const nombre = formData.get("nombre") || "";
    const email = formData.get("email") || "";
    const dni = (formData.get("dni") || "").toUpperCase();
    const password = formData.get("password") || "";
    const repeatPassword = formData.get("repeatPassword") || "";

    setError("");
    setSuccess("");

    // Validaciones
    if (nombre === "") {
      setError("El nombre no puede estar vacío.");
      return;
    }
    if (email === "") {
      setError("El correo electrónico no puede estar vacío.");
      return;
    }
    if (!email.includes("@")) {
      setError("El correo electrónico debe contener '@'.");
      return;
    }
    if (dni === "") {
      setError("El DNI no puede estar vacío.");
      return;
    }
    if (!dniRegex.test(dni)) {
      setError("El DNI debe tener 8 dígitos seguidos de una letra mayúscula.");
      return;
    }
    if (password === "") {
      setError("La contraseña no puede estar vacía.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    const contentnumber = /\d/;
    if (!contentnumber.test(password)) {
      setError("La contraseña debe contener al menos un número.");
      return;
    }
    if (password !== repeatPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    // Llamar al API de registro REAL
    setLoading(true);
    try {
      const result = await api.register({
        nombre,
        email,
        password,
        dni,
      });

      if (result && result.success) {
        setSuccess("Usuario creado correctamente. Redirigiendo al login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(result?.message || "Error al registrar el usuario.");
      }
    } catch (err) {
      console.error("Error en registro:", err);
      const message =
        err?.message || err?.response?.data?.message || "Error al registrar el usuario.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <form className="new-user-form" onSubmit={handleSubmit}>
        {/* Header con acento amarillo */}
        <div className="form-header">
          <div className="header-accent-line"></div>
          <h2 className="header-title">Nuevo Usuario</h2>
          <div className="header-underline"></div>
        </div>

        <div className="form-body">
          {/* MOSTRAR ERROR SI EXISTE */}
          {error && (
            <div className="error-message">
              <div className="error-icon-container">
                <div className="error-icon"></div>
                <span className="error-text">{error}</span>
              </div>
            </div>
          )}

          {/* MOSTRAR ÉXITO */}
          {success && (
            <div
              style={{
                background: "rgba(16, 185, 129, 0.15)",
                border: "1px solid #10b981",
                borderRadius: "8px",
                padding: "0.75rem 1rem",
                marginBottom: "1rem",
                color: "#10b981",
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              {success}
            </div>
          )}

          <div className="input-group">
            <label htmlFor="nombre" className="input-label">
              Nombre y Apellidos
            </label>
            <input
              className="input-field"
              type="text"
              name="nombre"
              id="nombre"
              placeholder="Antonio Ruiz Cifuentes"
            />
          </div>

          <div className="input-group">
            <label htmlFor="email" className="input-label">
              Correo Electrónico
            </label>
            <input
              className="input-field"
              type="email"
              name="email"
              id="email"
              placeholder="ejemplo@tallermoto.com"
            />
          </div>

          <div className="input-group">
            <label htmlFor="dni" className="input-label">
              DNI / CIF
            </label>
            <input
              className="input-field"
              type="text"
              name="dni"
              id="dni"
              placeholder="47231882W"
              style={{ textTransform: "uppercase" }}
            />
          </div>

          <div className="input-group">
            <label htmlFor="password" className="input-label">
              Contraseña
            </label>
            <input
              className="input-field"
              type="password"
              name="password"
              id="password"
              placeholder="••••••••"
            />
          </div>

          <div className="input-group">
            <label htmlFor="repeatPassword" className="input-label">
              Confirmar Contraseña
            </label>
            <input
              className="input-field"
              type="password"
              name="repeatPassword"
              id="repeatPassword"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            <span className="submit-button-content">
              {loading ? "Registrando..." : "Crear Usuario"}
              {!loading && (
                <svg
                  className="submit-button-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              )}
            </span>
          </button>
        </div>

        {/* Footer decorativo */}
        <div className="form-footer">
          <div className="footer-text-container">
            <div className="footer-dot"></div>
            Emrider Servicio Oficial Öhlins
            <div className="footer-dot"></div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default FormNewUser;
