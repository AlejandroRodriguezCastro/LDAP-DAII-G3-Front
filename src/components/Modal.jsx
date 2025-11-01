import React from "react";
import "./styles/modal.css";

const Modal = ({ content, onAccept, onClose, acceptText = "Aceptar", cancelText = "Cancelar" }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-body">{typeof content === "function" ? content() : content}</div>
        <div className="modal-actions">
          <button className="modal-btn" onClick={onClose}>{cancelText}</button>
          <button className="modal-btn" onClick={() => { onAccept(); onClose(); }}>{acceptText}</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
