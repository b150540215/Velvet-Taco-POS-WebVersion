document.addEventListener("DOMContentLoaded", () => {
	updateCartDisplay();
});

document.getElementById("place-order").addEventListener("click", placeOrder);

async function updateCartDisplay() {
	const cart = JSON.parse(localStorage.getItem("cart")) || [];
	const cartItemsContainer = document.getElementById("cart-items");
	cartItemsContainer.innerHTML = ""; // Clear current content
	let totalprice = 0;
	for (const item of cart) {
		let price = "Unavailable";

		try {
			const priceresponse = await fetch(
				`/getItemPrice?item=${encodeURIComponent(item.name)}`
			);
			const pricedata = await priceresponse.json();
			if (pricedata && pricedata[0] && pricedata[0].price) {
				price = pricedata[0].price;
				if (item.quantity == undefined) {
					item.quantity = 1;
				}
				totalprice += price * item.quantity;
				console.log(totalprice);
			}
		} catch (error) {
			console.error("Error loading menu item price:", error);
		}

		const itemElement = document.createElement("div");
		itemElement.classList.add("cart-item");
		itemElement.innerHTML = `
            <span>${item.name}</span>
            <span>$${price}</span>
            <input type="number" value="${item.quantity}" min="1" class="item-quantity" data-item-name="${item.name}">
            <button class="delete-item" data-item-name="${item.name}">Delete</button>
        `;
		cartItemsContainer.appendChild(itemElement);
	}

	updateTotalPrice(parseFloat(totalprice.toFixed(2)));
	updateCartQuantityDisplay();
	attachEventListeners();
}

function updateItemQuantity(itemName, newQuantity) {
	let cart = JSON.parse(localStorage.getItem("cart")) || [];
	const itemIndex = cart.findIndex((item) => item.name === itemName);
	if (itemIndex > -1) {
		cart[itemIndex].quantity = newQuantity;
		updateLocalStorage(cart);
		updateCartDisplay(); // Refresh cart display
	}
}

function getTotalQuantity() {
	const cart = JSON.parse(localStorage.getItem("cart")) || [];
	let totalQuantity = 0;

	for (let i = 0; i < cart.length; i++) {
		totalQuantity += cart[i].quantity;
	}

	return totalQuantity;
}

function updateCartQuantityDisplay() {
	const totalQuantity = getTotalQuantity();
	if (totalQuantity != 0) {
		document.getElementById(
			"cart_img"
		).src = `../pictures/carts/cart${totalQuantity}.png`;
	} else {
		document.getElementById("cart_img").src = `../pictures/carts/cart.png`;
	}
}

function attachEventListeners() {
    // Event listener for quantity changes
    document.querySelectorAll(".item-quantity").forEach((input) => {
        input.addEventListener("change", (e) => {
            const itemName = e.target.dataset.itemName;
            updateItemQuantity(itemName, parseInt(e.target.value));
        });
    });

    // Event listener for delete button
    document.querySelectorAll(".delete-item").forEach((button) => {
        button.addEventListener("click", (e) => {
            const itemName = e.target.dataset.itemName;
            removeItemFromCart(e, itemName); // Pass the event object
        });
    });
}


function removeItemFromCart(event,itemName) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    console.log(cart);
    cart = cart.filter((item) => item.name !== itemName);
    updateLocalStorage(cart);
    updateCartDisplay(); // Refresh cart display
    event.stopPropagation(); // Stop event propagation to prevent side panel from closing
}

function updateTotalPrice(totalPrice) {
	const cart = JSON.parse(localStorage.getItem("cart")) || [];
	document.getElementById(
		"total-price"
	).textContent = `Total: $${totalPrice.toFixed(2)}`;
}

function updateLocalStorage(cart) {
	localStorage.setItem("cart", JSON.stringify(cart));
}

document.getElementById("clear-cart").addEventListener("click", () => {
	localStorage.setItem("cart", JSON.stringify([])); // Clear the cart in Local Storage
	updateCartDisplay(); // Update the display
});

async function placeOrder() {
	let cart = JSON.parse(localStorage.getItem("cart")) || [];
	var cashier;
	if (localStorage.getItem("google_email")) {
		cashier = localStorage.getItem("google_email");
	} else {
		cashier = "Guest"; // Replace with actual cashier name
	}
	if (cart.length === 0) {
		alert("Your cart is empty.");
		return;
	}

	cart = unpackCart(cart);

	try {
		console.log(JSON.stringify(cart[0].name));

		const response = await fetch("/submitCustomerOrder", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ items: cart, cashier: cashier }),
		});

		console.log(response);
		alert("Order placed successfully.");
		localStorage.setItem("cart", JSON.stringify([])); // Clear the cart after order is placed
		updateCartDisplay(); // Update the cart display
	} catch (error) {
		console.error("Error placing order:", error);
		alert("There was an error placing your order.");
	}
}

function unpackCart(cart) {
	let unpackedCart = [];
	cart.forEach((item) => {
		for (let i = 0; i < item.quantity; ++i) {
			unpackedCart.push({ name: item.name, quantity: 1 });
		}
	});
	return unpackedCart;
}

const cartIconToggle = document.getElementById("cart-icon-toggle");
const sideMenu = document.getElementById("side-menu");
const closeSideMenuButton = document.getElementById("close-side-menu");

cartIconToggle.addEventListener("click", () => {
	sideMenu.classList.toggle("active");
});

// Close the side menu when clicking outside of it
document.addEventListener("click", (event) => {
	if (
		!sideMenu.contains(event.target) &&
		!cartIconToggle.contains(event.target)
	) {
		sideMenu.classList.remove("active");
	}
});

closeSideMenuButton.addEventListener("click", () => {
	sideMenu.classList.remove("active");
});
