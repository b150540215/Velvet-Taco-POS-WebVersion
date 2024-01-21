import React, { useEffect, useState } from "react";
import Modal from "react-modal";
// import "../../index.css";

const IngredientModal = ({ isOpen, onRequestClose, onAddToCart, item }) => {
  const modalStyle = {
    content: {
      width: "55%",
      height: "55%",
      margin: "auto",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      flexDirection: "column",
    },
  };

  const buttonContainerStyle = {
    display: "flex",
    justifyContent: "space-between",
    width: "50%",
    margin: "auto",
    marginBottom: "1rem",
  };

  const checkboxContainerStyle = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    margin: "auto",
  };

  const handleCheckboxChange = (ingredient) => {
    setIngredients((prevIngredients) => {
      const updatedIngredients = {
        ...prevIngredients,
        [ingredient]: !prevIngredients[ingredient],
      };
      return updatedIngredients;
    });
  };

  const [ingredients, setIngredients] = useState();
  const [count, setCount] = useState(1);
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const fetchItemsIngredients = async () => {
      try {
        const encodedItem = encodeURIComponent(item.name);

        const response = await fetch(
          `${process.env.REACT_APP_SERVER_URL}api/manager/tables/inventory/ingredients?item=${encodedItem}`
        );
        if (!response.ok) {
          throw new Error(`Request failed with status: ${response.status}`);
        }
        const _ingredients = await response.json();
        setIngredients(
          _ingredients.data.data.reduce((acc, curr) => {
            acc[curr.ingredient] = false;
            return acc;
          }, {})
        );
      } catch (err) {
        console.error(err.message);
      }
    };

    fetchItemsIngredients();
  }, [isOpen]);

  return (
    <div>
      {/* <button onClick={() => setModalIsOpen(true)}>Open Modal</button> */}

      <Modal
        isOpen={isOpen}
        onRequestClose={() => onRequestClose}
        // className="warning-modal"
        style={modalStyle}
      >
        <h2>Modify '{item.name}'</h2>
        <div style={checkboxContainerStyle}>
          <h5 className>Exclude?</h5>
          {ingredients &&
            Object.keys(ingredients).map((ingredient) => {
              return (
                <label key={ingredient}>
                  {ingredient}
                  <input
                    className="ml-2"
                    type="checkbox"
                    checked={ingredients[ingredient]}
                    onChange={() => handleCheckboxChange(ingredient)}
                  />
                </label>
              );
            })}
        </div>
        <div className="container"></div>
        <div style={buttonContainerStyle}>
          <button className="btn btn-secondary" onClick={onRequestClose}>
            Cancel
          </button>

          <span
            className={`cart-remove-item mr-2 ${count === 1 ? "disabled" : ""}`}
            onClick={() => setCount(Math.max(1, count - 1))}
          >
            <h3>&minus;</h3>
          </span>
          <h3>
            <span>{count}</span>
          </h3>
          <span
            className="cart-add-another ml-2"
            onClick={() => setCount(count + 1)}
          >
            <h3>+</h3>
          </span>
          <button className="btn btn-primary" onClick={onAddToCart}>
            Add to Cart
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default IngredientModal;
