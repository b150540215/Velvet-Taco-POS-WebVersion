import React, { useContext, useState } from "react";
import { CashierContext } from "../../context/CashierContext";
import IngredientModal from "./IngredientModal";

const MenuItem = ({ item, index }) => {
  const { cart, setCart, total, setTotal } = useContext(CashierContext);

  // for customizing the items
  const [ingredientModalIsOpen, setIngredientModalIsOpen] = useState(false);

  const handleClickItem = () => {
    setIngredientModalIsOpen(true);
    // setRequestedItem(item);
  };

  const handleClick = () => {
    const index = cart.findIndex((obj) => obj.item.name === item.name);
    console.log(index);

    if (index != -1) {
      setCart((prevArray) => [
        ...prevArray.slice(0, index),
        { ...prevArray[index], quantity: prevArray[index].quantity + 1 },
        ...prevArray.slice(index + 1),
      ]);
    } else {
      setCart([...cart, { item: item, quantity: 1 }]);
    }

    setTotal(total + item.price);
    setIngredientModalIsOpen(false);
  };

  return (
    <>
      <div className="card-link" onClick={handleClickItem}>
        <div
          className={`card ${index % 2 === 0 ? "even" : "odd"}`}
          style={{ width: "16rem", height: "10rem", position: "relative" }}
        >
          <div className="card-body text-center">
            {cart[item] && cart[item].quantity > 0 && (
              <div className="menu-quantity-icon">
                Test{cart[item].quantity}
              </div>
            )}
            {/* <h4>{cart[item.name].quantity}</h4> */}
            <h4>{item.name}</h4>
          </div>
        </div>
      </div>
      <IngredientModal
        isOpen={ingredientModalIsOpen}
        onRequestClose={() => setIngredientModalIsOpen(false)}
        onAddToCart={handleClick}
        item={item}
      />
    </>
  );
};

export default MenuItem;
