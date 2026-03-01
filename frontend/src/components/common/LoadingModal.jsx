import React from "react";

function LoadingModal({ isOpen = true, message = "Cargando..." }) {
  if (!isOpen) return null;

  return (
    <div className="loading-fullpage">
      <div className="notif-modal__spinner" />
      <p className="loading-fullpage__message">{message}</p>
    </div>
  );
}

export default LoadingModal;
