import React from "react";
import { CheckCircleIcon, XCircleIcon, XIcon } from "@phosphor-icons/react";

function NotificationModal({ isOpen, type = "success", message, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="notif-overlay" onClick={onClose}>
      <div className="notif-modal" onClick={(e) => e.stopPropagation()}>
        <button className="notif-modal__close" onClick={onClose}>
          <XIcon size={18} />
        </button>
        <div className={`notif-modal__icon notif-modal__icon--${type}`}>
          {type === "success" ? <CheckCircleIcon size={52} /> : <XCircleIcon size={52} />}
        </div>
        <p className="notif-modal__message">{message}</p>
        <button className="notif-modal__btn" onClick={onClose}>
          Aceptar
        </button>
      </div>
    </div>
  );
}

export default NotificationModal;
