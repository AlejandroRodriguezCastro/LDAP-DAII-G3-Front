import { createContext } from "react";

const ModalContext = createContext({
  showModal: () => {},
  hideModal: () => {},
  modalProps: null,
});

export default ModalContext;
