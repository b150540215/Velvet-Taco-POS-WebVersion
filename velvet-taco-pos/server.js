const express = require("express");
const { Client } = require("pg");
const path = require("path");
const app = express();
app.use(express.json());
const PORT = 3000;

const client = new Client({
	connectionString:
		"postgresql://csce315_904_04user:csce315_904_04@csce-315-db.engr.tamu.edu/csce315_904_04db",
});

client.connect((err) => {
	if (err) {
		console.error("Failed to connect to the database!", err.stack);
	} else {
		console.log("Successfully connected to the database.");
	}
});

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, "HTML")));

app.use("/CSS", express.static(path.join(__dirname, "CSS")));

app.use("/JS", express.static(path.join(__dirname, "JS")));

app.use("/pictures", express.static(path.join(__dirname, "pictures")));
async function checkMenu(name) {
	const checkMenuQuery = "SELECT * FROM menu WHERE name = $1";
	const checkMenuValues = [name];
	try {
		const result = await client.query(checkMenuQuery, checkMenuValues);
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
			await client.query(insertMenuInventoryQuery, insertMenuInventoryValues);
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
		await client.query(deleteMenuInventoryQuery, deleteMenuInventoryValues);
		await client.query(deleteMenuQuery, deleteMenuValues);
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
			await client.query(updateMenuQuery, updateMenuValues);
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

		const priceResult = await client.query(
			getMenuPriceQuery,
			getMenuPriceValues
		);

		let menu_price = 0.0;

		if (priceResult.next()) {
			menu_price = priceResult.getFloat(1);
		}

		return menu_price;
	} catch (error) {
		console.error("Error checking menu:", error);
		return false;
	}
}

async function addTotalOrder(orderID, item_name) {
	let menu_price = await getItemPrice(item_name);
	try {
		const addOrderTotalQuery =
			"UPDATE orders SET total = total + $1 WHERE order_id = $2";
		const addOrderTotalValues = [menu_price, orderID];

		await client.query(addOrderTotalQuery, addOrderTotalValues);
	} catch (error) {
		console.error("Error checking menu:", error);
		return false;
	}
}

async function insertMenuOrder(item_name) {
	try {
		const getIdQuery = "SELECT COUNT(*) FROM menu_orders";
		const idResultSet = await client.query(getIdQuery);
		let row_count = 0;

		if (idResultSet.rows.length >= 0) {
			const count = parseInt(idResultSet.rows[0].count); // Convert count to a number
			row_count = count + 1;
		}

		const orderIDQuery = "SELECT * FROM orders ORDER BY 1 DESC LIMIT 1";
		const orderIDResult = await client.query(orderIDQuery);

		let orderID = 1;
		if (orderIDResult.next()) {
			orderID = orderIDResult.getInt(1);
		}

		await addTotalOrder(orderID, item_name);

		const getMenuIdQuery = "SELECT menu_id FROM menu WHERE name = $1";
		const getMenuIDValues = [item_name];

		const getMenuIdResult = await client(getMenuIdQuery, getMenuIDValues);

		let menu_id = 0;

		if (getMenuIdResult.next()) {
			menu_id = getMenuIdResult.getInt(1);
		}

		const insertMenuOrderQuery =
			"INSERT INTO menu_orders (unique_id, order_id, menu_id) VALUES ($1, $2, $3)";
		const insertMenuOrderValues = [row_count, orderID, menu_id];

		await client(insertMenuOrderQuery, insertMenuOrderValues);
	} catch (error) {
		console.error("Error checking menu:", error);
		return false;
	}
}

async function newOrder(cashier) {
	try {
		const IdQuery = "SELECT * FROM orders ORDER BY 1 DESC LIMIT 1";
		const IdResult = await client.query(IdQuery);

		let count = 0;
		if (IdResult.rows.length > 0) {
			count = idResult.rows[0].id + 1;
		}

		let currentDate = new Date();
		let formattedDate = currentDate.toISOString().slice(0, 10);
		formattedDate = formattedDate.replace(/-/g, "/");
		let formattedTime = currentDate.toTimeString().slice(0, 8);

		// Insert new order
		let insertQuery =
			"INSERT INTO orders (id, date, time, cashier, total, status) VALUES ($1, $2, $3, $4, $5, $6)";
		let values = [count, formattedDate, formattedTime, cashier, 0, "Fulfilled"];

		await client.query(insertQuery, values);
	} catch (error) {
		console.error("Error checking menu:", error);
		return false;
	}
}

async function updateIngredientQuantity(ingredientName) {
	try {
		const updateSql =
			"UPDATE inventory SET quantity = quantity - 1 WHERE ingredient = $1";

		await client.query(updateSql, [ingredientName]);
	} catch (error) {
		console.error("Error updating ingredient quantity", error);
	}
}

async function checkInventory(ingredient) {
	try {
		const sql =
			"SELECT * FROM inventory WHERE ingredient = $1 AND quantity > 0";

		const result = await client.query(sql, [ingredient]);

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
		let ingredientsResult = await client.query(selectQuery, [itemName]);

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
		ingredientsResult = await client.query(selectQuery, [itemName]);
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

app.post("/submitOrder", async (req, res) => {
	const items = req.body.items;
	const cashier = req.body.cashier;
	console.log(items);
	try {
		await newOrder(cashier);

		for (let item of items) {
			let itemName = item.name;
			console.log(itemName);
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
	} catch (error) {
		console.error("Error submit order:", error);
		res.status(500).json({ error: "Error submit order." });
	}
});

app.post("/submitCustomerOrder", async (req, res) => {
	const items = req.body.items;
	const cashier = req.body.cashier;

	try {
		await newCustomerOrder(cashier);

		for (let item of items) {
			let itemName = item.name;

			// Check if menu item exists
			if (await checkMenu(itemName)) {
				// Decrease inventory
				if (await decreaseInventory(itemName)) {
					// Insert menu order
					await insertCustomerMenuOrder(itemName);
				} else {
					console.log(`Failed to insert ${itemName} to menu order`);
				}
			}
		}
		res.status(200).json({ message: "Order placed successfully" });
	} catch (error) {
		console.error("Error submit order:", error);
		res.status(500).json({ error: "Error submit order." });
	}
});

async function newCustomerOrder(cashier) {
	try {
		const IdQuery = "SELECT * FROM orders ORDER BY 1 DESC LIMIT 1";
		const IdResult = await client.query(IdQuery);
		let count = 0;
		if (IdResult.rows.length > 0) {
			count = IdResult.rows[0].order_id + 1; // Assuming the first column is 'id'
		}
		console.log(count);
		let currentDate = new Date();
		let formattedDate = currentDate
			.toISOString()
			.slice(0, 10)
			.replace(/-/g, "/");
		let formattedTime = currentDate.toTimeString().slice(0, 8);

		// Insert new order
		let insertQuery =
			"INSERT INTO orders (order_id, date, time, cashier, total, status) VALUES ($1, $2, $3, $4, $5, $6)";
		let values = [count, formattedDate, formattedTime, cashier, 0, "Fulfilled"];
		await client.query(insertQuery, values);
	} catch (error) {
		console.error("Error checking menu:", error);
		return false;
	}
}

async function insertCustomerMenuOrder(item_name) {
	try {
		const getIdQuery = "SELECT COUNT(*) FROM menu_orders";
		const idResultSet = await client.query(getIdQuery);
		let row_count = 0;

		if (idResultSet.rows.length >= 0) {
			const count = parseInt(idResultSet.rows[0].count); // Convert count to a number
			row_count = count + 1;
		}

		const orderIDQuery = "SELECT * FROM orders ORDER BY 1 DESC LIMIT 1";
		const orderIDResult = await client.query(orderIDQuery);

		let orderID = 1;
		if (orderIDResult.rows.length > 0) {
			orderID = orderIDResult.rows[0].order_id; // Assuming the first column is 'id'
		}

		// Rest of your code...

		await addTotalOrder(orderID, item_name);

		const getMenuIdQuery = "SELECT menu_id FROM menu WHERE name = $1";
		const getMenuIDValues = [item_name];

		const getMenuIdResult = await client.query(getMenuIdQuery, getMenuIDValues);

		let menu_id = 0;

		if (getMenuIdResult.rows.length > 0) {
			menu_id = getMenuIdResult.rows[0].menu_id; // Assuming 'menu_id' is the column name
		}

		const insertMenuOrderQuery =
			"INSERT INTO menu_orders (unique_id, order_id, menu_id) VALUES ($1, $2, $3)";
		const insertMenuOrderValues = [row_count, orderID, menu_id];

		if (await client.query(insertMenuOrderQuery, insertMenuOrderValues)) {
			return true;
		}
	} catch (error) {
		console.error("Error checking menu:", error);
		return false;
	}
}

async function getItemPrice(item_name) {
	try {
		if (!(await checkMenu(item_name))) {
			console.log("Item does not exist");
		}

		const getMenuPriceQuery = "SELECT price FROM menu WHERE name = $1";
		const getMenuPriceValues = [item_name];

		const priceResult = await client.query(
			getMenuPriceQuery,
			getMenuPriceValues
		);

		let menu_price = 0.0;

		if (priceResult.rows.length > 0) {
			menu_price = parseFloat(priceResult.rows[0].price); // Assuming 'price' is the column name
		}

		return menu_price;
	} catch (error) {
		console.error("Error checking menu:", error);
		return false;
	}
}

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

		await client.query(deleteNameQuery, deleteNameValues);

		res.status(200).json({ message: "Employee item deleted successfully." });
	} catch (error) {
		console.error("Error deleting Employee item:", error);
		res.status(500).json({ error: "Error deleting Employee item." });
	}
});

app.post("/insert_employee", async (req, res) => {
	const name = req.body.name;
	const role = req.body.role;
	const pay = req.body.pay;
	const schedule = req.body.schedule;

	if (!name || !role || pay === undefined || !schedule) {
		return res
			.status(400)
			.json({ error: "Missing required parameters (ingredient or quantity)." });
	}

	try {
		const getIdQuery = "SELECT COUNT(*) FROM employees";
		const idResultSet = await client.query(getIdQuery);
		let id = 0;

		if (idResultSet.rows.length >= 0) {
			const count = parseInt(idResultSet.rows[0].count); // Convert count to a number
			id = count + 1;
		}

		const insertEmployeeQuery =
			"INSERT INTO employees(id, name, role, pay, schedule) VALUES ($1, $2, $3, $4, $5)";
		const insertEmployeeValues = [id, name, role, pay, schedule];

		await client.query(insertEmployeeQuery, insertEmployeeValues);

		res.status(200).json({ message: "Employee added successfully." });
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

		await client.query(updateInventoryQuery, updateInventoryValues);

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

		await client.query(deleteInventoryQuery, deleteInventoryValues);

		res.status(200).json({ message: "Inventory item deleted successfully." });
	} catch (error) {
		console.error("Error deleting inventory item:", error);
		res.status(500).json({ error: "Error deleting inventory item." });
	}
});

app.post("/insert_inventory", async (req, res) => {
	const ingredient = req.body.ingredient;
	const quantity = req.body.quantity;
	const restock_quantity = req.body.restockQuantity;
	const min_quantity = req.body.minQuantity;

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
			"INSERT INTO inventory(ingredient, quantity, restock_quantity, min_quantity) VALUES ($1, $2, $3, $4)";
		const insertInventoryValues = [
			ingredient,
			quantity,
			restock_quantity,
			min_quantity,
		];

		await client.query(insertInventoryQuery, insertInventoryValues);

		res.status(200).json({ message: "Inventory item added successfully." });
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

// Create an async route handler for removing a menu item
app.post("/remove_menu", async (req, res) => {
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
		const idResultSet = await client.query(getMenuIdQuery);
		let menu_id = 0;

		if (idResultSet.rows.length >= 0) {
			const count = parseInt(idResultSet.rows[0].count); // Convert count to a number
			menu_id = count + 1;
		}

		const insertMenuQuery =
			"INSERT INTO menu (menu_id, name, calories, price, type) VALUES ($1, $2, $3, $4, $5)";
		const insertMenuValues = [menu_id, item_name, calories, price, foodtype];
		await client.query(insertMenuQuery, insertMenuValues);

		await insertMenuInventory(item_name, ingredients);

		res.status(200).json({ message: "Menu item inserted successfully." });
	} catch (error) {
		console.error("Error inserting menu item:", error);
		res.status(500).json({ error: "Error inserting menu item." });
	}
});

app.get("/what_sells_together", async (req, res) => {
	const startDate = req.query.startDate;
	const endDate = req.query.endDate;

	// Check if the start and end dates were provided
	if (!startDate || !endDate) {
		return res.status(400).json({ error: "Start and end dates are required." });
	}

	let query =
		"SELECT menu.name, " +
		"COUNT(*) as total_orders " +
		"FROM orders INNER JOIN " +
		"menu_orders ON orders.order_id = menu_orders.order_id " +
		"INNER JOIN menu ON menu_orders.menu_id = menu.menu_id " +
		"WHERE orders.date BETWEEN $1 AND $2 " +
		"GROUP BY menu.name " +
		"ORDER BY total_orders DESC";

	client.query(query, [startDate, endDate], (err, result) => {
		if (err) {
			console.error("Error executing query: ", err);
			return res.status(500).send("Error fetching items that sell together");
		}

		const resultItems = [];
		const salesData = new Map();
		const processedItems = [];

		result.rows.forEach((row) => {
			salesData.set(row.name, row.total_orders);
		});

		for (const [item1, total1] of salesData) {
			if (processedItems.includes(item1)) {
				continue;
			}

			let itemPair = "";
			for (const [item2, total2] of salesData) {
				// Skip comparing an item with itself or with items that have already been processed
				if (item1 === item2 || processedItems.includes(item2)) {
					continue;
				}

				if (total1 === total2) {
					itemPair = `${item1}, ${item2}, ${total1}\n`;

					processedItems.push(item1);
					processedItems.push(item2);
					break;
				}
			}

			if (itemPair != "") {
				resultItems.push(itemPair);
			}
		}

		res.json(resultItems);
	});
});

app.get("/getItemsOfCategory", async (req, res) => {
	const category = req.query.category;
	try {
		let query = "Select * from menu WHERE type = $1";
		client.query(query, [category], (err, result) => {
			if (err) {
				res.status(500).send("Error getItemsOfCategory fetching data");
				return;
			}
			res.json(result.rows);
		});
	} catch (error) {
		console.error("Error submit order:", error);
		res.status(500).json({ error: "Error submit order." });
	}
});

app.get("/getCategoryofMenu", async (req, res) => {
	try {
		let query = "Select DISTINCT type from menu";
		client.query(query, (err, result) => {
			if (err) {
				res.status(500).send("Error getCategoryofMenu fetching data");
				return;
			}
			res.json(result.rows);
		});
	} catch (error) {
		console.error("Error get Category of Menu:", error);
		res.status(500).json({ error: "Error get Category of Menu." });
	}
});

app.get("/getItemIngredients", async (req, res) => {
	const item = req.query.item;
	try {
		let query = "SELECT ingredient FROM menu_inventory WHERE item_name = $1";
		client.query(query, [item], (err, result) => {
			if (err) {
				res.status(500).send("Error getItemIngredients fetching data");
				return;
			}
			res.json(result.rows);
		});
	} catch (error) {
		console.error("Error get item ingredients:", error);
		res.status(500).json({ error: "Error get item ingredients." });
	}
});

app.get("/getItemPrice", async (req, res) => {
	const item = req.query.item;
	try {
		let query = "SELECT price FROM menu WHERE name = $1";
		client.query(query, [item], (err, result) => {
			if (err) {
				res.status(500).send("Error getItemPrice fetching data");
				return;
			}
			res.json(result.rows);
		});
	} catch (error) {
		console.error("Error get item price:", error);
		res.status(500).json({ error: "Error get item price." });
	}
});

app.get("/getItemCalories", async (req, res) => {
	const item = req.query.item;
	try {
		let query = "SELECT calories FROM menu WHERE name = $1";
		client.query(query, [item], (err, result) => {
			if (err) {
				res.status(500).send("Error getItemCalories fetching data");
				return;
			}
			res.json(result.rows);
		});
	} catch (error) {
		console.error("Error get item calories:", error);
		res.status(500).json({ error: "Error get item calories." });
	}
});

app.get("/get_table", async (req, res) => {
	const name = req.query.name;

	// Check if the name query parameter was provided
	if (!name) {
		return res.status(400).json({ error: "Name parameter is required." });
	}

	let query = `SELECT * FROM "${name}" ORDER BY 1`;
	client.query(query, (err, result) => {
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
	client.query(query, (err, result) => {
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

app.get("/excess_report", async (req, res) => {
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
	client.query(query, [startDate, endDate], (err, result) => {
		if (err) {
			res.status(500).send("Error fetching data");
			return;
		}
		res.json(result.rows);
	});
});

app.get("/get_product_usage_data", async (req, res) => {
	const startDate = req.query.startDate;
	const endDate = req.query.endDate;

	console.log("Start Date: " + startDate);

	// Check if the start and end dates were provided
	if (!startDate || !endDate) {
		return res.status(400).json({ error: "Start and end dates are required." });
	}

	// Query the database to get product usage data based on the date range
	let query = `
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

	client.query(query, [startDate, endDate], (err, result) => {
		if (err) {
			res.status(500).send("Error fetching product usage data");
			return;
		}
		const productUsageData = {};
		result.rows.forEach((row) => {
			productUsageData[row.ingredient] = row.usage;
		});
		res.json(productUsageData);
	});
});

app.get("/restock_report", async (req, res) => {
	const query =
		"SELECT ingredient, quantity, min_quantity FROM inventory WHERE quantity < min_quantity";

	client.query(query, (err, result) => {
		if (err) {
			console.error("Error executing query:", err);
			return res.status(500).send("Error fetching items needing restocking.");
		}

		const itemsToRestock = result.rows.map((row) => {
			return `${row.ingredient} (Current: ${row.quantity}, Min: ${row.min_quantity})`;
		});

		res.json(itemsToRestock);
	});
});

// Handle 404 - Keep this as the last route
app.use((req, res, next) => {
	res.status(404).send("Sorry, page not found!");
});

app.listen(PORT, "0.0.0.0", () => {
	console.log(`Server started on http://0.0.0.0:${PORT}`);
});
