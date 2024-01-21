require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const db = require("./db");
const { format } = require("path");
const app = express();

app.use(cors());
app.use(express.json());
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
    // Additional session configuration
  })
);
// console.log(process.env);
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await db.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    const user = result.rows[0];

    // console.log(user);

    if (user && isValidPassword(password, user.password)) {
      // Assume isValidPassword is a function you've defined
      // Assuming you're using session-based authentication
      req.session.userId = user.username;
      req.session.userType = user.user_type;

      // Send the user type as a response
      res.status(200).json({ userType: user.user_type });
    } else {
      if (!user) {
        res.status(401).json({ message: "Invalid password" });
      } else {
        console.log(user.username);
        res.status(401).json({ message: "Invalid credentials" });
      }
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

function isValidPassword(enteredPassword, storedPassword) {
  return enteredPassword === storedPassword;
}

function checkUserType(requiredType) {
  return (req, res, next) => {
    if (!req.session.userId || req.session.userType !== requiredType) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
}

function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  }
  // If the user is not logged in, redirect to the login page or send an error
  res.status(401).send("Unauthorized: No session available");
}

function authorizeUserType(requiredType) {
  return (req, res, next) => {
    if (req.session.userType === requiredType) {
      return next();
    }
    res.status(403).send("Access Denied: Insufficient privileges");
  };
}

app.get(
  "/api/admin",
  isAuthenticated,
  authorizeUserType("admin"),
  (req, res) => {
    // Only accessible to users with 'admin' user type
    res.send("This is an admin-only page");
  }
);

app.get(
  "/api/manager",
  isAuthenticated,
  authorizeUserType("manager"),
  (req, res) => {
    // Only accessible to users with 'admin' user type
    res.send("This is an manager-only page");
  }
);

app.get(
  "/api/cashier",
  isAuthenticated,
  authorizeUserType("cashier"),
  (req, res) => {
    // Only accessible to users with 'admin' user type
    res.send("This is an cashier-only page");
  }
);

/*
Gets `limit` entries from `table`. If no limit is specified (identified by -1),
then all entries are returned.
*/
app.get("/api/manager/tables", async (req, res) => {
  if (!req.query.table) {
    res.status(400).json({ error: "Missing a value for the key 'table'" });
  }
  const table = req.query.table;
  const limit = req.query.limit ?? "-1";

  try {
    const desc = table === "orders" ? "DESC" : "";
    const _limit = limit === "-1" ? "" : `LIMIT ${limit}`;
    const results = await db.query(
      `SELECT * FROM ${table} ORDER BY 1 ${desc} ${_limit}`
    );
    const count = await db.query(`SELECT COUNT(*) FROM ${table}`);

    res.status(200).json({
      results: results.rows.length,
      max_results: Number(count.rows[0].count),
      data: {
        data: results.rows,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/admin/tables", async (req, res) => {
  if (!req.query.table) {
    res.status(400).json({ error: "Missing a value for the key 'table'" });
  }
  const table = req.query.table;
  const limit = req.query.limit ?? "-1";

  try {
    const desc = table === "orders" ? "DESC" : "";
    const _limit = limit === "-1" ? "" : `LIMIT ${limit}`;
    const results = await db.query(
      `SELECT * FROM ${table} ORDER BY 1 ${desc} ${_limit}`
    );
    const count = await db.query(`SELECT COUNT(*) FROM ${table}`);

    res.status(200).json({
      results: results.rows.length,
      max_results: Number(count.rows[0].count),
      data: {
        data: results.rows,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/admin/tables", async (req, res) => {
  const table = req.body.table;
  const pkey = req.body.pkey;
  const pkey_value = req.body.pkey_value;

  try {
    const results = await db.query(
      `DELETE FROM ${table} WHERE ${pkey} = $1 RETURNING *`,
      [pkey_value]
    );
    res.status(204).json({
      status: "success",
      // results: results.rows.length,
      // data: {
      //   data: results.rows,
      // },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/admin/tables/users", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  const user_type = req.body.user_type;
  const name = req.body.name;

  if (!username || !password || !email || !name) {
    return res.status(400).json({
      error: "Missing required parameters (username/password/email/owner).",
    });
  }
  if (
    user_type != "admin" &&
    user_type != "manager" &&
    user_type != "cashier"
  ) {
    return res
      .status(400)
      .json({ error: "Unknown user role (admin/manager/cashier)." });
  }

  try {
    const getIdQuery = "SELECT COUNT(*) FROM users";
    const idResultSet = await db.query(getIdQuery);
    let id = 0;

    if (idResultSet.rows.length >= 0) {
      const count = parseInt(idResultSet.rows[0].count);
      id = count + 1;
    }

    const insertUsersQuery =
      "INSERT INTO users(username, password, email, user_type, name) VALUES ($1, $2, $3, $4, $5) RETURNING *";
    const insertUsersValues = [username, password, email, user_type, name];

    const results = await db.query(insertUsersQuery, insertUsersValues);

    res.status(200).json({
      message: "Users added successfully.",
      data: {
        data: results.rows,
      },
    });
  } catch (error) {
    console.error("Error inserting Users:", error);
    res.status(500).json({ error: "Error inserting Users." });
  }
});

app.get("/api/cashier/menus", async (req, res) => {
  const menu = req.query.menu;

  try {
    let query = "SELECT DISTINCT type FROM menu ORDER BY 1";
    if (menu) {
      query = "SELECT * FROM menu WHERE type = $1";
    }
    const results = await db.query(query, menu ? [menu] : []);
    res.status(200).json({
      results: results.rows.length,
      data: {
        data: results.rows,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

/*
Get an item's ingredients by its name
*/
app.get("/api/manager/tables/inventory/ingredients", async (req, res) => {
  const item = req.query.item;

  try {
    const results = await db.query(
      "SELECT ingredient FROM menu_inventory WHERE item_name = $1",
      [item]
    );

    res.status(200).json({
      results: results.rows.length,
      data: {
        data: results.rows,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

/*
Update an items ingredients
*/
app.put("/api/manager/tables/inventory/ingredients", async (req, res) => {
  const item = req.body.item;
  const ingredients = req.body.ingredients;

  try {
    await db.query("DELETE FROM menu_inventory where item_name = $1", [item]);

    for (let ingredient of ingredients) {
      await db.query(
        "INSERT INTO menu_inventory (item_name, ingredient) VALUES ($1, $2)",
        [item, ingredient.label]
      );
    }

    res.status(204).json({
      status: "success",
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

/*
Deletes a row from the given table using the primary key.
*/
app.delete("/api/manager/tables", async (req, res) => {
  const table = req.body.table;
  const pkey = req.body.pkey;
  const pkey_value = req.body.pkey_value;

  /* removing from menu requires removing from menu_inventory; delegate to own function */
  if (table === "menu") {
    remove_from_menu(pkey_value);
    return;
  }

  try {
    const results = await db.query(
      `DELETE FROM ${table} WHERE ${pkey} = $1 RETURNING *`,
      [pkey_value]
    );
    res.status(204).json({
      status: "success",
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

async function checkMenu(name) {
  const checkMenuQuery = "SELECT * FROM menu WHERE name = $1";
  const checkMenuValues = [name];
  try {
    const result = await db.query(checkMenuQuery, checkMenuValues);
    return result.rows.length > 0;
  } catch (error) {
    console.error("Error checking menu:", error);
    return false;
  }
}

// Function to insert menu inventory items
async function insertMenuInventory(itemName, ingredients) {
  try {
    for (const ingredient of ingredients) {
      const insertMenuInventoryQuery =
        "INSERT INTO menu_inventory (item_name, ingredient) VALUES ($1, $2)";
      const insertMenuInventoryValues = [itemName, ingredient];
      await db.query(insertMenuInventoryQuery, insertMenuInventoryValues);
    }
  } catch (error) {
    console.error("Error inserting menu inventory items:", error);
  }
}

// Define the deleteMenu function to remove a menu item
async function deleteMenu(item_name) {
  const deleteMenuQuery = "DELETE FROM menu WHERE name = $1";
  const deleteMenuValues = [item_name];

  const deleteMenuInventoryQuery =
    "DELETE FROM menu_inventory WHERE item_name = $1";
  const deleteMenuInventoryValues = [item_name];
  try {
    await db.query(deleteMenuInventoryQuery, deleteMenuInventoryValues);
    await db.query(deleteMenuQuery, deleteMenuValues);
    return true; // Return true if the deletion is successful
  } catch (error) {
    console.error("Error deleting menu item:", error);
    return false; // Return false if there's an error
  }
}

// Function to update a menu item
async function updateMenu(item_name, price) {
  try {
    const updateMenuQuery = "UPDATE menu SET price = $2 WHERE name = $1";
    const updateMenuValues = [item_name, price];
    if (checkMenu(item_name)) {
      await db.query(updateMenuQuery, updateMenuValues);
      return true; // Return true if the update is successful
    }
  } catch (error) {
    console.error("Error updating menu item:", error);
    return false; // Return false if there's an error
  }
}

async function getItemPrice(item_name) {
  try {
    if (!(await checkMenu(item_name))) {
      console.log("Item does not exist");
    }

    const getMenuPriceQuery = "SELECT price FROM menu WHERE name = $1";
    const getMenuPriceValues = [item_name];

    const priceResult = await db.query(getMenuPriceQuery, getMenuPriceValues);

    let menu_price = 0.0;

    if (priceResult.rows.length > 0) {
      menu_price = priceResult.rows[0].price;
    }

    return menu_price;
  } catch (error) {
    console.error("Error getting item price:", error);
    return false;
  }
}

async function addTotalOrder(orderID, item_name) {
  let menu_price = await getItemPrice(item_name);
  try {
    const addOrderTotalQuery =
      "UPDATE orders SET total = total + $1 WHERE order_id = $2";
    const addOrderTotalValues = [menu_price, orderID];

    await db.query(addOrderTotalQuery, addOrderTotalValues);
  } catch (error) {
    console.error("Error adding total order:", error);
    return false;
  }
}

async function insertMenuOrder(item_name) {
  try {
    const getIdQuery = "SELECT COUNT(*) FROM menu_orders";
    const idResultSet = await db.query(getIdQuery);
    let row_count = 0;

    if (idResultSet.rows.length >= 0) {
      row_count = idResultSet.rows[0].count + 1; // Convert count to a number
    }

    const orderIDQuery = "SELECT * FROM orders ORDER BY 1 DESC LIMIT 1";
    const orderIDResult = await db.query(orderIDQuery);

    let orderID = 1;
    if (orderIDResult.rows.length > 0) {
      orderID = orderIDResult.rows[0].order_id;
    }

    await addTotalOrder(orderID, item_name);

    const getMenuIdQuery = "SELECT menu_id FROM menu WHERE name = $1";
    const getMenuIDValues = [item_name];

    const getMenuIdResult = await db.query(getMenuIdQuery, getMenuIDValues);

    let menu_id = 0;

    if (getMenuIdResult.rows.length > 0) {
      menu_id = getMenuIdResult.rows[0].menu_id;
    }

    const insertMenuOrderQuery =
      "INSERT INTO menu_orders (unique_id, order_id, menu_id) VALUES ($1, $2, $3)";
    const insertMenuOrderValues = [row_count, orderID, menu_id];

    await db.query(insertMenuOrderQuery, insertMenuOrderValues);
  } catch (error) {
    console.error("Error insert menu order:", error);
    return false;
  }
}

async function newOrder(cashier) {
  try {
    const IdQuery = "SELECT * FROM orders ORDER BY 1 DESC LIMIT 1";
    const IdResult = await db.query(IdQuery);

    let count = 0;
    if (IdResult.rows.length > 0) {
      count = IdResult.rows[0].order_id + 1;
    }

    let currentDate = new Date();
    let cstOptions = { timeZone: "America/Chicago" };
    let year = currentDate.toLocaleString("en-US", {
      ...cstOptions,
      year: "numeric",
    });
    let month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
    let day = currentDate.toLocaleString("en-US", {
      ...cstOptions,
      day: "2-digit",
    });

    let formattedDate = `${year}/${month}/${day}`;
    let formattedTime = currentDate.toLocaleString("en-US", {
      ...cstOptions,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    let insertQuery =
      "INSERT INTO orders (order_id, date, time, cashier, total, status) VALUES ($1, $2, $3, $4, $5, $6)";
    let values = [count, formattedDate, formattedTime, cashier, 0, "Fulfilled"];

    await db.query(insertQuery, values);
  } catch (error) {
    console.error("Error in new order:", error);
    return false;
  }
}

async function updateIngredientQuantity(ingredientName) {
  try {
    const updateSql =
      "UPDATE inventory SET quantity = quantity - 1 WHERE ingredient = $1";

    await db.query(updateSql, [ingredientName]);
  } catch (error) {
    console.error("Error updating ingredient quantity", error);
  }
}

async function checkInventory(ingredient) {
  try {
    const sql =
      "SELECT * FROM inventory WHERE ingredient = $1 AND quantity > 0";

    const result = await db.query(sql, [ingredient]);

    return result.rows.length > 0;
  } catch (err) {
    console.error("Error checking inventory", err);

    return false;
  }
}

async function decreaseInventory(itemName) {
  let exist = false;

  try {
    // Get ingredients for item
    let selectQuery =
      "SELECT ingredient FROM menu_inventory WHERE item_name = $1";
    let ingredientsResult = await db.query(selectQuery, [itemName]);

    // Check each ingredient quantity
    for (let row of ingredientsResult.rows) {
      let ingredientName = row.ingredient;

      if (!(await checkInventory(ingredientName))) {
        console.log(
          `Ingredient ${ingredientName} does not exist or quantity <= 0`
        );
        return false;
      }
    }

    // Update each ingredient quantity
    ingredientsResult = await db.query(selectQuery, [itemName]);
    for (let row of ingredientsResult.rows) {
      let ingredientName = row.ingredient;
      await updateIngredientQuantity(ingredientName);
    }

    exist = true;
    return exist;
  } catch (error) {
    console.error("Error decreasing inventory", error);
    return false;
  }
}

app.post("/api/cashier/submit-order", async (req, res) => {
  const items = req.body.items;
  const cashier = req.body.cashier;

  try {
    await newOrder(cashier);

    for (let item of items) {
      for (i = 0; i < item.quantity; i++) {
        let itemName = item.item.name;

        // Check if menu item exists
        if (await checkMenu(itemName)) {
          // Decrease inventory
          if (await decreaseInventory(itemName)) {
            // Insert menu order
            await insertMenuOrder(itemName);
          } else {
            console.log(`Failed to insert ${itemName} to menu order`);
          }
        }
      }
    }

    res.status(201).json({
      success: "success",
    });
    // console.log("complete");
  } catch (error) {
    console.error("Error submit order:", error);
    res.status(500).json({ error: "Error submit order." });
  }
});

app.post("/remove_employee", async (req, res) => {
  const name = req.body.name;

  if (!name) {
    return res
      .status(400)
      .json({ error: "Missing required parameters (ingredient)." });
  }

  try {
    const deleteNameQuery = "DELETE FROM employees WHERE name = $1";
    const deleteNameValues = [name];

    await db.query(deleteNameQuery, deleteNameValues);

    res.status(200).json({ message: "Employee item deleted successfully." });
  } catch (error) {
    console.error("Error deleting Employee item:", error);
    res.status(500).json({ error: "Error deleting Employee item." });
  }
});

app.post("/api/manager/tables/employees", async (req, res) => {
  const name = req.body.name;
  const role = req.body.role;
  const pay = req.body.pay;
  const schedule = req.body.schedule;

  if (!name || !role || pay === undefined || !schedule) {
    return res.status(400).json({
      error: "Missing required parameters (name, role, pay, schedule).",
    });
  }

  try {
    const getIdQuery = "SELECT COUNT(*) FROM employees";
    const idResultSet = await db.query(getIdQuery);
    let id = 0;

    if (idResultSet.rows.length >= 0) {
      const count = parseInt(idResultSet.rows[0].count);
      id = count + 1;
    }

    const insertEmployeeQuery =
      "INSERT INTO employees(id, name, role, pay, schedule) VALUES ($1, $2, $3, $4, $5) RETURNING *";
    const insertEmployeeValues = [id, name, role, pay, schedule];

    const results = await db.query(insertEmployeeQuery, insertEmployeeValues);

    res.status(200).json({
      message: "Employee added successfully.",
      data: {
        data: results.rows,
      },
    });
  } catch (error) {
    console.error("Error inserting Employee:", error);
    res.status(500).json({ error: "Error inserting Employee." });
  }
});

app.post("/update_inventory", async (req, res) => {
  const ingredient = req.body.ingredient;
  const quantity = req.body.quantity;
  const restock_quantity = req.body.restockQuantity;

  if (!ingredient || quantity === undefined || restock_quantity === undefined) {
    return res
      .status(400)
      .json({ error: "Missing required parameters (ingredient or quantity)." });
  }

  try {
    const updateInventoryQuery =
      "UPDATE inventory SET quantity = $2, restock_quantity = $3 where ingredient = $1";
    const updateInventoryValues = [ingredient, quantity, restock_quantity];

    await db.query(updateInventoryQuery, updateInventoryValues);

    res.status(200).json({ message: "Inventory item updated successfully." });
  } catch (error) {
    console.error("Error updating inventory item:", error);
    res.status(500).json({ error: "Error updating  inventory item." });
  }
});

app.post("/remove_inventory", async (req, res) => {
  const ingredient = req.body.ingredient_name;

  console.log(ingredient);

  if (!ingredient) {
    return res
      .status(400)
      .json({ error: "Missing required parameters (ingredient)." });
  }

  try {
    const deleteInventoryQuery = "DELETE FROM inventory WHERE ingredient = $1";
    const deleteInventoryValues = [ingredient];

    await db.query(deleteInventoryQuery, deleteInventoryValues);

    res.status(200).json({ message: "Inventory item deleted successfully." });
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    res.status(500).json({ error: "Error deleting inventory item." });
  }
});

/* Add entry to menu table */
app.post("/api/manager/tables/menu", async (req, res) => {
  const item_name = req.body.item_name;
  const calories = req.body.calories;
  const price = req.body.price;
  const foodtype = req.body.foodtype;
  const ingredients = req.body.ingredients;

  if (!item_name || !calories || !price || !foodtype || !ingredients) {
    return res.status(400).json({ error: "Missing required parameters." });
  }

  try {
    // Use the checkMenu function to check if the menu item already exists
    const itemExists = await checkMenu(item_name);

    if (itemExists) {
      return res.status(400).json({ error: "The menu item already exists." });
    }

    const IdQuery = "SELECT * FROM menu ORDER BY 1 DESC LIMIT 1";
    const IdResult = await db.query(IdQuery);

    let menu_id = 0;
    if (IdResult.rows.length > 0) {
      menu_id = IdResult.rows[0].menu_id + 1;
    }

    const insertMenuQuery =
      "INSERT INTO menu (menu_id, name, calories, price, type) VALUES ($1, $2, $3, $4, $5)";
    const insertMenuValues = [menu_id, item_name, calories, price, foodtype];
    await db.query(insertMenuQuery, insertMenuValues);

    await insertMenuInventory(item_name, ingredients);

    res.status(200).json({ message: "Menu item inserted successfully." });
  } catch (error) {
    console.error("Error inserting menu item:", error);
    res.status(500).json({ error: "Error inserting menu item." });
  }
});

/* Update a current table entry */
app.put("/api/manager/tables", async (req, res) => {
  const table = req.body.table;
  const pkey = req.body.pkey;
  const pkey_value = req.body.pkey_value;
  const key = req.body.key;
  const value = req.body.value;

  try {
    const results = await db.query(
      `UPDATE ${table} SET ${key} = $1 WHERE ${pkey} = $2 RETURNING *`,
      [value, pkey_value]
    );
    res.status(204).json({
      status: "success",
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/manager/tables/inventory", async (req, res) => {
  const ingredient = req.body.ingredient;
  const quantity = req.body.quantity;
  const restock_quantity = req.body.restock_quantity;
  const min_quantity = req.body.min_quantity;

  if (
    !ingredient ||
    quantity === undefined ||
    restock_quantity === undefined ||
    min_quantity === undefined
  ) {
    return res
      .status(400)
      .json({ error: "Missing required parameters (ingredient or quantity)." });
  }

  try {
    const insertInventoryQuery =
      "INSERT INTO inventory(ingredient, quantity, restock_quantity, min_quantity) VALUES ($1, $2, $3, $4) RETURNING *";
    const insertInventoryValues = [
      ingredient,
      quantity,
      restock_quantity,
      min_quantity,
    ];

    const results = await db.query(insertInventoryQuery, insertInventoryValues);

    res.status(200).json({
      message: "Inventory item added successfully.",
      data: {
        data: results.rows,
      },
    });
  } catch (error) {
    console.error("Error inserting inventory item:", error);
    res.status(500).json({ error: "Error inserting inventory item." });
  }
});

app.post("/update_menu", async (req, res) => {
  const item_name = req.body.item_name;
  const price = req.body.price;

  if (!item_name || price === undefined) {
    return res
      .status(400)
      .json({ error: "Missing required parameters (item_name or price)." });
  }

  try {
    // Call the updateMenu function to update the menu item
    await updateMenu(item_name, price);

    res.status(200).json({ message: "Menu item updated successfully." });
  } catch (error) {
    console.error("Error updating menu item:", error);
    res.status(500).json({ error: "Error updating menu item." });
  }
});

/* Delete from menu table */
app.delete("/api/manager/tables/menu", async (req, res) => {
  const item_name = req.body.item_name;

  if (!item_name) {
    return res
      .status(400)
      .json({ error: "Missing required parameter (item_name)." });
  }

  try {
    // Call the deleteMenu function to remove the menu item
    const deleted = await deleteMenu(item_name);

    if (deleted) {
      res.status(200).json({ message: "Menu item removed successfully." });
    } else {
      res.status(500).json({ error: "Error removing menu item." });
    }
  } catch (error) {
    console.error("Error removing menu item:", error);
    res.status(500).json({ error: "Error removing menu item." });
  }
});

app.post("/insert_menu", async (req, res) => {
  const item_name = req.body.item_name;
  const calories = req.body.calories;
  const price = req.body.price;
  const foodtype = req.body.foodtype;
  const ingredients = req.body.ingredients;

  if (!item_name || !calories || !price || !foodtype || !ingredients) {
    return res.status(400).json({ error: "Missing required parameters." });
  }

  try {
    // Use the checkMenu function to check if the menu item already exists
    const itemExists = await checkMenu(item_name);

    if (itemExists) {
      return res.status(400).json({ error: "The menu item already exists." });
    }

    const getMenuIdQuery = "SELECT COUNT(*) FROM menu";
    const idResultSet = await db.query(getMenuIdQuery);
    let menu_id = 0;

    if (idResultSet.rows.length >= 0) {
      const count = parseInt(idResultSet.rows[0].count); // Convert count to a number
      menu_id = count + 1;
    }

    const insertMenuQuery =
      "INSERT INTO menu (menu_id, name, calories, price, type) VALUES ($1, $2, $3, $4, $5)";
    const insertMenuValues = [menu_id, item_name, calories, price, foodtype];
    await db.query(insertMenuQuery, insertMenuValues);

    await insertMenuInventory(item_name, ingredients);

    res.status(200).json({ message: "Menu item inserted successfully." });
  } catch (error) {
    console.error("Error inserting menu item:", error);
    res.status(500).json({ error: "Error inserting menu item." });
  }
});

app.get("/api/manager/reports/sells-together", async (req, res) => {
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;

  // Check if the start and end dates were provided
  if (!startDate || !endDate) {
    return res.status(400).json({ error: "Start and end dates are required." });
  }

  const query = `
  WITH MenuPairs AS (
    SELECT
        mo1.menu_id AS menu_id1,
        mo2.menu_id AS menu_id2,
        COUNT(DISTINCT mo1.order_id) AS order_count
    FROM
        menu_orders mo1
        INNER JOIN menu_orders mo2 ON mo1.order_id = mo2.order_id
                                     AND mo1.menu_id < mo2.menu_id
        INNER JOIN orders o ON mo1.order_id = o.order_id
    WHERE
        o.date BETWEEN $1 AND $2
    GROUP BY
        mo1.menu_id, mo2.menu_id
),
MenuIndividualCounts AS (
    SELECT
        mo.menu_id,
        COUNT(DISTINCT mo.order_id) AS individual_count
    FROM
        menu_orders mo
        INNER JOIN orders o ON mo.order_id = o.order_id
    WHERE
        o.date BETWEEN $1 AND $2
    GROUP BY
        mo.menu_id
)

SELECT
    ROW_NUMBER() OVER (ORDER BY order_count DESC) AS uid,
    m1.name AS menu_item1,
    COALESCE(mic1.individual_count, 0) AS menu_item1_count,
    m2.name AS menu_item2,
    COALESCE(mic2.individual_count, 0) AS menu_item2_count,
    COALESCE(mp.order_count, 0) AS order_count
FROM
    MenuPairs mp
    INNER JOIN menu m1 ON mp.menu_id1 = m1.menu_id
    INNER JOIN menu m2 ON mp.menu_id2 = m2.menu_id
    LEFT JOIN MenuIndividualCounts mic1 ON m1.menu_id = mic1.menu_id
    LEFT JOIN MenuIndividualCounts mic2 ON m2.menu_id = mic2.menu_id
ORDER BY
    order_count DESC, menu_item1, menu_item2
  `;

  const results = await db.query(query, [startDate, endDate]);

  res.status(200).json({
    results: results.rows.length,
    max_results: results.rows.length,
    data: {
      data: results.rows,
    },
  });

  // let query =
  //   "SELECT menu.name, " +
  //   "COUNT(*) as total_orders " +
  //   "FROM orders INNER JOIN " +
  //   "menu_orders ON orders.order_id = menu_orders.order_id " +
  //   "INNER JOIN menu ON menu_orders.menu_id = menu.menu_id " +
  //   "WHERE orders.date BETWEEN $1 AND $2 " +
  //   "GROUP BY menu.name " +
  //   "ORDER BY total_orders DESC";

  // db.query(query, [startDate, endDate], (err, result) => {
  //   if (err) {
  //     console.error("Error executing query: ", err);
  //     return res.status(500).send("Error fetching items that sell together");
  //   }

  //   const resultItems = [];
  //   const salesData = new Map();
  //   const processedItems = [];

  //   result.rows.forEach((row) => {
  //     salesData.set(row.name, row.total_orders);
  //   });

  //   for (const [item1, total1] of salesData) {
  //     if (processedItems.includes(item1)) {
  //       continue;
  //     }

  //     let itemPair = "";
  //     for (const [item2, total2] of salesData) {
  //       // Skip comparing an item with itself or with items that have already been processed
  //       if (item1 === item2 || processedItems.includes(item2)) {
  //         continue;
  //       }

  //       if (total1 === total2) {
  //         itemPair = `${item1}, ${item2}, ${total1}\n`;

  //         processedItems.push(item1);
  //         processedItems.push(item2);
  //         break;
  //       }
  //     }

  //     if (itemPair != "") {
  //       resultItems.push(itemPair);
  //     }
  //   }

  //   res.json(resultItems);
  // });
});

app.get("/get_table", async (req, res) => {
  const name = req.query.name;

  // Check if the name query parameter was provided
  if (!name) {
    return res.status(400).json({ error: "Name parameter is required." });
  }

  let query = `SELECT * FROM "${name}" ORDER BY 1`;
  db.query(query, (err, result) => {
    if (err) {
      res.status(500).send("Error fetching data");
      return;
    }
    res.json(result.rows);
  });
});

//Equal to check_menu in Backend.java
app.get("/check_menu", async (req, res) => {
  const name = req.query.name;

  // Check if the name query parameter was provided
  if (!name) {
    return res.status(400).json({ error: "Name parameter is required." });
  }

  let query = `SELECT * FROM menu WHERE name = '${name}'`;
  db.query(query, (err, result) => {
    if (err) {
      res.status(500).send("Error fetching data");
      return;
    }
    if (result.rows.length > 0) {
      res.json({ exists: true });
    } else {
      res.json({ exists: false });
    }
  });
});

app.get("/api/manager/reports/excess", async (req, res) => {
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  let query =
    "WITH MenuItemCounts AS (" +
    "    SELECT m.name, COUNT(*) as totalCount " +
    "    FROM orders o " +
    "    JOIN menu_orders mo ON o.order_id = mo.order_id " +
    "    JOIN menu m ON m.menu_id = mo.menu_id " +
    "    WHERE o.date BETWEEN $1 AND $2 " +
    "    GROUP BY m.name " +
    "), IngredientCounts AS (" +
    "    SELECT mi.ingredient, SUM(mc.totalCount) as totalCount " +
    "    FROM MenuItemCounts mc " +
    "    JOIN menu_inventory mi ON mc.name = mi.item_name " +
    "    GROUP BY mi.ingredient " +
    ") " +
    //Select all the ingredient in database which the total count of sell is less than 10% of inventory
    "SELECT i.ingredient, i.totalCount " +
    "FROM IngredientCounts i " +
    "JOIN inventory inv ON i.ingredient = inv.ingredient " +
    "WHERE i.totalCount < (inv.quantity / 10)";
  const results = await db.query(query, [startDate, endDate]);

  res.status(200).json({
    results: results.rows.length,
    max_results: results.rows.length,
    data: {
      data: results.rows,
    },
  });
});

app.get("/api/manager/reports/sales", async (req, res) => {
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  const query = `
    SELECT
      menu.name,
      menu.price,
      COUNT(*) as total_orders
    FROM
      orders
      INNER JOIN menu_orders ON orders.order_id = menu_orders.order_id
      INNER JOIN menu ON menu_orders.menu_id = menu.menu_id
    WHERE
      orders.date BETWEEN $1 AND $2
    GROUP BY
      menu.name, menu.price
    ORDER BY
      menu.name
    `;

  const results = await db.query(query, [startDate, endDate]);

  res.status(200).json({
    results: results.rows.length,
    max_results: results.rows.length,
    data: {
      data: results.rows,
    },
  });
});

app.get("/api/manager/reports/product-usage", async (req, res) => {
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;

  // Check if the start and end dates were provided
  if (!startDate || !endDate) {
    return res.status(400).json({ error: "Start and end dates are required." });
  }

  const query = `
      SELECT ingredient, SUM(totalCount) as usage
      FROM (
          SELECT mi.ingredient, mc.totalCount
          FROM (
              SELECT m.name, COUNT(*) as totalCount
              FROM orders o
              JOIN menu_orders mo ON o.order_id = mo.order_id
              JOIN menu m ON m.menu_id = mo.menu_id
              WHERE o.date BETWEEN $1 AND $2
              GROUP BY m.name
          ) mc
          JOIN menu_inventory mi ON mc.name = mi.item_name
      ) usage_data
      GROUP BY ingredient
      ORDER BY ingredient;
  `;

  try {
    const results = await db.query(query, [startDate, endDate]);

    res.status(200).json({
      results: results.rows.length,
      max_results: results.rows.length,
      data: {
        data: results.rows,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/manager/reports/restock", async (req, res) => {
  try {
    const results = await db.query(
      "SELECT ingredient, quantity, min_quantity FROM inventory WHERE quantity < min_quantity"
    );

    res.status(200).json({
      results: results.rows.length,
      max_results: results.rows.length,
      data: {
        data: results.rows,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
