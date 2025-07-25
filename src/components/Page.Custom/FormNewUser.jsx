import React, { useState } from "react";

function FormNewUser() {
  const [error, setError] = useState("");

  const dniRegex = /^[0-9]{8}[A-Z]$/; // Regex para validar el DNI español

  const handleSubmit = (event) => {
    event.preventDefault();

    // Obtener valores usando FormData (más seguro)
    const formData = new FormData(event.target);
    const email = formData.get("email") || "";
    const dni = formData.get("dni") || "";
    const password = formData.get("password") || "";
    const repeatPassword = formData.get("repeatPassword") || "";

    // Limpiar error anterior
    setError("");

    // 1. Validar campos vacíos PRIMERO
    if (email === "") {
      setError("El correo electrónico no puede estar vacío.");
      return;
    }
    if (dni === "") {
      setError("El DNI no puede estar vacío.");
      return;
    }
    if (password === "") {
      setError("La contraseña no puede estar vacía.");
      return;
    }
    if (repeatPassword === "") {
      setError("Debe repetir la contraseña.");
      return;
    }

    // 2. Validar formato de email
    if (!email.includes("@")) {
      setError("El correo electrónico debe contener '@'.");
      return;
    }

    // 3. Validar formato de DNI
    if (!dniRegex.test(dni)) {
      setError("El DNI debe tener 8 dígitos seguidos de una letra mayúscula.");
      return;
    }

    // 4. Validar que la contraseña tenga al menos un número
    const contentnumber = /\d/;
    if (!contentnumber.test(password)) {
      setError("La contraseña debe contener al menos un número.");
      return;
    }

    // 5. Validar que las contraseñas coincidan
    if (password !== repeatPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    // Si llegamos aquí, todo está correcto
    setError("");

    // En un entorno de producción, podrías usar una librería de notificaciones
    const successMessage = document.createElement("div");
    successMessage.className = "success-message";
    successMessage.textContent = "Usuario creado correctamente!";
    document.body.appendChild(successMessage);
    setTimeout(() => {
      document.body.removeChild(successMessage);
    }, 3000); // Eliminar el mensaje después de 3 segundos

    console.log({ email, dni, password });
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
              DNI
            </label>
            <input
              className="input-field"
              type="text"
              name="dni"
              id="dni"
              placeholder="12345678A"
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

          <button type="submit" className="submit-button">
            <span className="submit-button-content">
              Crear Usuario
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
      {/* Mensaje de éxito flotante */}
      <style>
        {`
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        .success-message {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background-color: rgba(76, 175, 80, 0.9); /* Green */
          color: white;
          padding: 15px 25px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          z-index: 1000;
          animation: fadeOut 0.5s ease-out 2.5s forwards;
        }
        `}
      </style>
    </div>
  );
}

export default FormNewUser;
