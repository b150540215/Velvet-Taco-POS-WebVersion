import React, { useState } from "react";
import Modal from "react-modal";
// import "../../index.css";

const Error = ({ isOpen, onRequestClose }) => {
  const modalStyle = {
    content: {
      width: "25%",
      height: "25%",
      margin: "auto",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
  };

  const buttonContainerStyle = {
    display: "flex",
    justifyContent: "space-between",
    width: "50%",
    marginTop: "2.5rem",
  };

  return (
    <div>
      {/* <button onClick={() => setModalIsOpen(true)}>Open Modal</button> */}

      <Modal
        isOpen={isOpen}
        onRequestClose={() => onRequestClose}
        // className="warning-modal"
        style={modalStyle}
      >
        <h2>Failed to place order!</h2>
        <h6 className="mt-4 text-center">
          Please add at least 1 item to the cart to place an order.
        </h6>
        <div className="m-auto">
          <button className="btn btn-secondary" onClick={onRequestClose}>
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Error;
