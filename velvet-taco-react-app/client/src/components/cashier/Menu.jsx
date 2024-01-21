import React, { useContext, useEffect } from "react";
import { CashierContext } from "../../context/CashierContext";
import MenuItemsContainer from "./MenuItemsContainer";

const Menu = () => {
  const { currentMenu, menuItems, setMenuItems } = useContext(CashierContext);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const url =
          process.env.REACT_APP_SERVER_URL +
          `api/cashier/menus?menu=${currentMenu}`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Request failed with status: ${response.status}`);
        }
        const _menu_items = await response.json();
        setMenuItems(_menu_items);
        // console.log("data: ", _data);
      } catch (err) {
        console.error(err.message);
      }
    };
    if (currentMenu) {
      fetchMenu();
    }
  }, [currentMenu]);

  return <MenuItemsContainer items={menuItems}></MenuItemsContainer>;
};

export default Menu;
