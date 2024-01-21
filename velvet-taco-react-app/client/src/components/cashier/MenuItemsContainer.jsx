import React, { useContext } from "react";
import MenuItem from "./MenuItem";
// import Modal from "./Modal";
import { CashierContext } from "../../context/CashierContext";

const MenuItemsContainer = ({ items }) => {
  const { showModal } = useContext(CashierContext);

  return (
    <div className="container-fluid">
      <div className="row">
        {items &&
          items.data.data.map((row, index) => (
            <div key={row.menu_id} className="col-md-4 mb-4">
              <MenuItem item={row} index={index} />
            </div>
          ))}
      </div>
    </div>
  );
};

export default MenuItemsContainer;
