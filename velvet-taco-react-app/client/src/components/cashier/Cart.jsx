import React, { Fragment, useContext, useState } from "react";
import { CashierContext } from "../../context/CashierContext";
import ErrorModal from "../cashier/ErrorModal";
import IngredientModal from "./IngredientModal";

const Cart = () => {
  const { cart, setCart, total, setTotal, requestedItem } =
    useContext(CashierContext);

  // for when user tries to place an order with nothing
  const [errorModalIsOpen, setErrorModalIsOpen] = useState(false);
  // for customizing the items
  const [ingredientModalIsOpen, setIngredientModalIsOpen] = useState(false);

  const handleClear = () => {
    setCart([]);
    setTotal(0);
  };

  const removeItem = (name) => {
    const index = cart.findIndex((obj) => obj.item.name === name);
    setTotal(total - cart[index].item.price);

    if (cart[index].quantity === 1) {
      setCart((prevArray) => prevArray.filter((_, i) => i !== index));
      return;
    }
    setCart((prevArray) => [
      ...prevArray.slice(0, index),
      { ...prevArray[index], quantity: prevArray[index].quantity - 1 },
      ...prevArray.slice(index + 1),
    ]);
  };

  const addAnother = (name) => {
    const index = cart.findIndex((obj) => obj.item.name === name);
    setCart((prevArray) => [
      ...prevArray.slice(0, index),
      { ...prevArray[index], quantity: prevArray[index].quantity + 1 },
      ...prevArray.slice(index + 1),
    ]);

    setTotal(total + cart[index].item.price);
  };

  // hardcoded for now. when it is deployed, it will go to the link below
  //   const SERVERURL = "http://localhost:3001/";
  //   const SERVERURL = "https://project-3-server-d4yp.onrender.com/";
  // hard coded until sign in is complete
  const cashier = "Demo Cashier";
  const handlePlace = async () => {
    if (cart.length < 1) {
      setErrorModalIsOpen(true);
      return;
    }

    try {
      const response = await fetch(
        process.env.REACT_APP_SERVER_URL + "api/cashier/submit-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: cart,
            cashier: cashier,
          }),
        }
      );
      if (!response.ok) {
        throw new Error(`Request failed with status: ${response.status}`);
      }
    } catch (err) {
      console.error(err.message);
    }

    handleClear();
  };

  return (
    <div className="ml-3">
      <div className="cart-brand-container">
        <img src="https://fortworthtexasdentist.com/wp-content/uploads/2014/09/velvet-taco-1024x1024.png"></img>
      </div>
      <h2 className="text-center mt-2">Cart</h2>
      <br />

      {cart &&
        cart.map((item) => {
          return (
            <div key={item.item.id} className="cart-item-container">
              <span
                className="cart-remove-item mr-2"
                onClick={() => removeItem(item.item.name)}
              >
                &minus;
              </span>
              <h6 className="mr-auto">
                {item.item.name} x {item.quantity}
              </h6>
              <h5 className="ml-auto">
                ${(item.item.price * item.quantity).toFixed(2)}
              </h5>
              <span
                className="cart-add-another ml-2"
                onClick={() => addAnother(item.item.name)}
              >
                +
              </span>
            </div>
          );
        })}

      {cart && <h5 className="text-center mt-4">Total: ${total.toFixed(2)}</h5>}
      <br />
      <div className="text-center mt-2">
        <button className="btn btn-danger mr-3" onClick={handleClear}>
          Clear Order
        </button>
        <button className="btn btn-success ml-3" onClick={handlePlace}>
          Place Order
        </button>
      </div>
      <ErrorModal
        isOpen={errorModalIsOpen}
        onRequestClose={() => setErrorModalIsOpen(false)}
      />
    </div>
  );
};

export default Cart;
