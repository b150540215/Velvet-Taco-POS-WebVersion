import React, { useState } from "react";
import Modal from "react-modal";
// import "../../index.css";

const WarningModal = ({ isOpen, onRequestClose, onDeleteConfirm, rowData }) => {
  const modalStyle = {
    content: {
      width: "35%",
      height: "35%",
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

  // console.log(rowData);

  return (
    <div>
      {/* <button onClick={() => setModalIsOpen(true)}>Open Modal</button> */}

      <Modal
        isOpen={isOpen}
        onRequestClose={() => onRequestClose}
        // className="warning-modal"
        style={modalStyle}
      >
        <h2>
          This action is <span style={underline}>irreversible</span>!
        </h2>
        <h6 className="mt-5">
          Are you sure you wish to permanently delete the following?
        </h6>
        {rowData && (
          <table className="table table-hover table-dark">
            <tbody>
              <tr style={{ pointerEvents: "none" }}>
                {Object.values(rowData).map((value, index) => (
                  <td key={index}>{value}</td>
                ))}
              </tr>
            </tbody>
          </table>
        )}
        <div style={buttonContainerStyle}>
          <button className="btn btn-secondary" onClick={onRequestClose}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onDeleteConfirm}>
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default WarningModal;
