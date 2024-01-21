import React, { useContext, useEffect, useState } from "react";
import Select from "react-select";
import { ManagerContext } from "../../context/ManagerContext";

const MultiOptionsTableCell = ({ item, onSave }) => {
  const { requestRefresh } = useContext(ManagerContext);
  const [isEditing, setIsEditing] = useState(false);
  const [initialValue, setInitialValue] = useState([]);
  const [initialValueString, setInitialValueString] = useState("");
  const [selectedValues, setSelectedValues] = useState([]);
  const [options, setOptions] = useState([]);

  useEffect(() => {
    const fetchIngredientOptions = async () => {
      try {
        const response = await fetch(
          process.env.REACT_APP_SERVER_URL +
            `api/manager/tables/?table=inventory`
        );
        if (!response.ok) {
          throw new Error(`Request failed with status: ${response.status}`);
        }
        const ingredients = await response.json();
        setOptions(
          ingredients.data.data.map((item) => ({
            value: item.ingredient,
            label: item.ingredient,
          }))
        );
      } catch (err) {
        console.error(err.message);
      }
    };
    fetchIngredientOptions();

    const fetchItemsIngredients = async () => {
      try {
        const encodedItem = encodeURIComponent(item);

        const response = await fetch(
          `${process.env.REACT_APP_SERVER_URL}api/manager/tables/inventory/ingredients?item=${encodedItem}`
        );
        if (!response.ok) {
          throw new Error(`Request failed with status: ${response.status}`);
        }
        const ingredients = await response.json();
        setSelectedValues(
          ingredients.data.data.map((item) => ({
            value: item.ingredient,
            label: item.ingredient,
          }))
        );
        setInitialValue(
          ingredients.data.data.map((item) => ({
            value: item.ingredient,
            label: item.ingredient,
          }))
        );

        setInitialValueString(
          ingredients.data.data.map((item) => item.ingredient).join(", ")
        );
      } catch (err) {
        console.error(err.message);
      }
    };

    fetchItemsIngredients();
  }, [requestRefresh]);

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleChange = (selectedOptions) => {
    setSelectedValues(selectedOptions);
  };

  const handleBlur = () => {
    setIsEditing(false);

    console.log(selectedValues);
    console.log(initialValue);

    if (
      selectedValues &&
      encodeURIComponent(selectedValues) === encodeURIComponent(initialValue)
    ) {
      return;
    }
    console.log("dealt");
    onSave([initialValue, selectedValues]);
  };

  return (
    <td onClick={handleClick} tabIndex="0">
      {isEditing ? (
        <Select
          isMulti
          value={selectedValues}
          options={options}
          onChange={handleChange}
          onBlur={handleBlur}
          autoFocus
          styles={{
            option: (provided, state) => ({
              ...provided,
              color: state.isSelected ? "white" : "#333",
            }),
            multiValueRemove: (provided) => ({
              ...provided,
              color: "#333",
            }),
          }}
        />
      ) : (
        <span>{initialValueString}</span>
      )}
    </td>
  );
};

export default MultiOptionsTableCell;
