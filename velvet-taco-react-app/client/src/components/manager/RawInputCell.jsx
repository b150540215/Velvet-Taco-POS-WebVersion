import React, { useState } from "react";

const RawInputCell = ({ initialValue, onSave, cellType, isInt = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(initialValue);

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.target.blur();
    }
  };

  const handleBlur = () => {
    setIsEditing(false);

    const value =
      cellType === "number"
        ? isInt
          ? parseInt(inputValue, 10) || 0
          : parseFloat(inputValue) || 0
        : inputValue;
    if (value == initialValue) {
      return;
    }
    onSave(value);
    setInputValue(initialValue);
  };

  return (
    <td onClick={handleClick} tabIndex="0">
      {isEditing ? (
        <input
          type={cellType}
          value={inputValue}
          onKeyDown={handleKeyDown}
          onChange={handleChange}
          onBlur={handleBlur}
          autoFocus
        />
      ) : (
        <span>{initialValue}</span>
      )}
    </td>
  );
};

export default RawInputCell;
