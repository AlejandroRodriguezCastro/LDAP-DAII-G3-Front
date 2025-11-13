import React, { useState, useCallback } from "react";
import ModalContext from "./ModalContext.jsx";
import Modal from "../Modal.jsx";

const ModalProvider = ({ children }) => {
  const [modalProps, setModalProps] = useState(null);
  const [validToSave, setValidToSave] = useState(true); // ✅ nuevo estado

  const showModal = useCallback((props) => {
    setValidToSave(true); // por defecto habilitado
    setModalProps(props);
  }, []);

  const hideModal = useCallback(() => {
    setModalProps(null);
  }, []);

  return (
    <ModalContext.Provider
      value={{ showModal, hideModal, modalProps, validToSave, setValidToSave }}
    >
      {children}
      {modalProps && (
        <Modal {...modalProps} validToSave={validToSave} onClose={hideModal} />
      )}
    </ModalContext.Provider>
  );
};

export default ModalProvider;
