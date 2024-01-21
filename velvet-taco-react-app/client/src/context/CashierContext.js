import React, { useState, createContext } from "react";

export const CashierContext = createContext();

export const CashierContextProvider = (props) => {
  const [cart, setCart] = useState([]);
  const [currentMenu, setCurrentMenu] = useState("Chicken");
  const [menuItems, setMenuItems] = useState();
  const [total, setTotal] = useState(0);
  const [menus, setMenus] = useState();
  const [excludes, setExcludes] = useState();
  const [requestedItem, setRequestedItem] = useState();

  return (
    <CashierContext.Provider
      value={{
        cart,
        setCart,
        currentMenu,
        setCurrentMenu,
        menuItems,
        setMenuItems,
        menus,
        setMenus,
        total,
        setTotal,
        excludes,
        setExcludes,
      }}
    >
      {props.children}
    </CashierContext.Provider>
  );
};
