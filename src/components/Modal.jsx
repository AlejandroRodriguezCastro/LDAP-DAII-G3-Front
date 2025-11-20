import React from "react";
import "./styles/modal.css";

const Modal = ({
  content,
  onAccept,
  onClose,
  acceptText = "Aceptar",
  cancelText = "Cancelar",
  validToSave = true,
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">

        {/* Scroll interno para no romper el borde */}
        <div className="modal-scroll">
          <div className="modal-body">
            {typeof content === "function" ? content() : content}
          </div>
        </div>

        <div className="modal-actions">
          <button className="modal-btn modal-btn-cancel" onClick={onClose}>
            {cancelText}
          </button>

          <button
            className="modal-btn"
            disabled={!validToSave}
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
