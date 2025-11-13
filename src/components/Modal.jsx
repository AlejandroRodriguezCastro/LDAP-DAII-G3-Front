import React from "react";
import "./styles/modal.css";

const Modal = ({
  content,
  onAccept,
  onClose,
  acceptText = "Aceptar",
  cancelText = "Cancelar",
  validToSave = true, // ✅ nueva prop
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-body">
          {typeof content === "function" ? content() : content}
        </div>

        <div className="modal-actions">
          <button className="modal-btn modal-btn-cancel" onClick={onClose}>
            {cancelText}
          </button>
          <button
            className="modal-btn"
            disabled={!validToSave} // ✅ deshabilita si es false
            onClick={() => {
              onAccept();
              onClose();
            }}
          >
            {acceptText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
