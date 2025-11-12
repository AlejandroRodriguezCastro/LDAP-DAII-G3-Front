import React, { useState, useCallback } from "react";
import ModalContext from "./ModalContext.jsx";
import Modal from "../Modal.jsx";

const ModalProvider = ({ children }) => {
  const [modalProps, setModalProps] = useState(null)

  const showModal = useCallback((props) => {
    setModalProps(props);
  }, [])

  const hideModal = useCallback(() => {
    setModalProps(null);
  }, [])

  return (
    <ModalContext.Provider value={{ showModal, hideModal, modalProps }}>
      {children}
      {modalProps && (
        <Modal {...modalProps} onClose={hideModal} />
      )}
    </ModalContext.Provider>
  )
}

export default ModalProvider