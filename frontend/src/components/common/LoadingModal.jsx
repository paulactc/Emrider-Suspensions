import React from "react";

function LoadingModal({ isOpen = true, message = "Cargando..." }) {
  if (!isOpen) return null;

  return (
    <div className="notif-overlay">
      <div className="notif-modal">
        <div className="notif-modal__icon notif-modal__icon--loading">
          <div className="notif-modal__spinner" />
        </div>
        <p className="notif-modal__message">{message}</p>
      </div>
    </div>
  );
}

export default LoadingModal;
