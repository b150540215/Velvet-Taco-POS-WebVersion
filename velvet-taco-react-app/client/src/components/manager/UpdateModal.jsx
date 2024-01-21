import React, { useState } from "react";
import Modal from "react-modal";
// import "../../index.css";

const UpdateModal = ({
  isOpen,
  onRequestClose,
  onUpdateConfirm,
  field,
  from,
  to,
}) => {
  const modalStyle = {
    content: {
      width: "30%",
      height: "30%",
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

  const underline = {
    color: "red",
    textDecoration: "underline",
  };

  return (
    <div>
      {/* <button onClick={() => setModalIsOpen(true)}>Open Modal</button> */}

      <Modal
        isOpen={isOpen}
        onRequestClose={() => onRequestClose}
        style={modalStyle}
      >
        <span>
          <h5 className="mt-2">Are you sure you wish to update "{field}"?</h5>
        </span>
        <div className="container-large mt-5">
          <table
            className="table table-hover table-dark"
            style={{ fontSize: "1.25rem" }}
          >
            <tbody>
              <tr style={{ pointerEvents: "none" }}>
                <td>
                  <span>{from}</span>
                </td>
                <td style={{ padding: "0 0.5rem", fontSize: "2rem" }}>
                  &rarr;
                </td>
                <td>
                  <span>{to}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style={buttonContainerStyle}>
          <button className="btn btn-secondary" onClick={onRequestClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={onUpdateConfirm}>
            Update
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default UpdateModal;
