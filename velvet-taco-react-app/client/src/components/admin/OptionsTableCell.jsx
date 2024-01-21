import React, { useState } from "react";

const OptionsTableCell = ({ initialValue, options, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedValue, setSelectedValue] = useState(initialValue);

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleFocus = () => {
    setIsEditing(true);
  };

  const handleChange = (e) => {
    setSelectedValue(e.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (selectedValue == initialValue) {
      return;
    }
    onSave(selectedValue);
  };

  return (
    <td onClick={handleClick} tabIndex="0">
      {isEditing ? (
        <select
          value={selectedValue}
          onChange={handleChange}
          onBlur={handleBlur}
          autoFocus
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <span onFocus={handleFocus}>{initialValue}</span>
      )}
    </td>
  );
};

export default OptionsTableCell;
