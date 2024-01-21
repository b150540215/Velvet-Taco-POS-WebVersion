document.addEventListener("DOMContentLoaded", function () {
	var storedFontSize = localStorage.getItem("fontSize");
	if (storedFontSize) {
		setFontSize(storedFontSize);
		// Set the input value to the stored font size
		document.getElementById("fontSizeInput").value = storedFontSize;
	}
	document.getElementById("signOutButton").addEventListener("click", signOut);

	if (checkLoginState()) {
		document.getElementById("loginButton").style.display = "none";
		document.getElementById("signOutButton").style.display = "inline";
		var storedName = localStorage.getItem("google_name");
		greeting(storedName);
	}

	updateCartQuantityDisplay();

	// Retrieve zoom level from local storage on page load
	var storedZoomLevel = localStorage.getItem("zoomLevel");
	var zoomLevel = storedZoomLevel ? parseFloat(storedZoomLevel) : 1;

	// Apply the initial zoom level
	document.body.style.transform = "scale(" + zoomLevel + ")";

	function centerOnElement(elem) {
		var rect = elem.getBoundingClientRect();
		var elemCenterX = rect.left + rect.width / 2;
		var elemCenterY = rect.top + rect.height / 2;
		var centerX = window.innerWidth / 2;
		var centerY = window.innerHeight / 2;

		window.scrollBy(elemCenterX - centerX, elemCenterY - centerY);
	}

	document.getElementById("zoomIn").addEventListener("click", function () {
		zoomLevel += 0.2;
		document.body.style.transform = "scale(" + zoomLevel + ")";
		centerOnElement(this);
		// Save the updated zoom level to local storage
		localStorage.setItem("zoomLevel", zoomLevel.toString());
	});

	document.getElementById("zoomOut").addEventListener("click", function () {
		zoomLevel -= 0.2;
		document.body.style.transform = "scale(" + zoomLevel + ")";
		centerOnElement(this);
		// Save the updated zoom level to local storage
		localStorage.setItem("zoomLevel", zoomLevel.toString());
	});

	document.getElementById("resetZoom").addEventListener("click", function () {
		zoomLevel = 1;
		document.body.style.transform = "scale(1)";
		// Save the reset zoom level to local storage
		localStorage.setItem("zoomLevel", zoomLevel.toString());
	});

	// Event listener for beforeunload to save the zoom level before leaving the page
	window.addEventListener("beforeunload", function () {
		localStorage.setItem("zoomLevel", zoomLevel.toString());
	});
});

document.getElementById("get_table").addEventListener("click", function () {
	const tableName = document.getElementById("tableNameInput").value;
	if (!tableName) {
		alert("Please enter a table name!");
		return;
	}

	fetch(`/get_table?name=${tableName}`)
		.then((response) => {
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			return response.text();
		})
		.then((data) => {
			document.getElementById("tableOutput").textContent = data;
		})
		.catch((error) => {
			console.error("There was a problem with get table operation:", error);
		});
});

document.getElementById("check_menu").addEventListener("click", function () {
	const itemName = document.getElementById("menuNameInput").value;
	if (!itemName) {
		alert("Please enter a item name!");
		return;
	}

	fetch(`/check_menu?name=${itemName}`)
		.then((response) => {
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			return response.json();
		})
		.then((data) => {
			const resultContainer = document.getElementById("checkMenuOutput");
			if (data.exists) {
				resultContainer.textContent = `${itemName} exists in the menu.`;
			} else {
				resultContainer.textContent = `${itemName} does not exist in the menu.`;
			}
		})
		.catch((error) => {
			console.error("There was a problem with checkMenu operation:", error);
		});
});

document.getElementById("weatherLink").addEventListener("click", function () {
	// Fetch weather data for College Station
	weather.fetchWeather();
	// Show the weather container
	document.getElementById("weatherContainer").classList.remove("hidden");
});

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

function openFontDropdown() {
	var fontDropdown = document.getElementById("settingsDropdown");
	fontDropdown.style.display =
		fontDropdown.style.display === "block" ? "none" : "block";
}

function changeFontSize() {
	var fontSizeInput = document.getElementById("fontSizeInput").value;
	setFontSize(fontSizeInput);
	// Store the new font size in local storage
	localStorage.setItem("fontSize", fontSizeInput);
	// Close the dropdown after applying changes
	document.getElementById("settingsDropdown").style.display = "none";
}

// Function to set font size and store it in local storage
function setFontSize(fontSize) {
	document.body.style.fontSize = fontSize + "px";
	localStorage.setItem("fontSize", fontSize);
}

function handleCredentialResponse(response) {
	// The ID token you need to pass to your backend:
	console.log("Encoded JWT ID token: " + response.credential);
	var id_token = response.credential;

	// Optional: Send the ID token to your server
	// ...

	// Decode the ID token (for front-end purposes only, don't use this for authentication)
	var decodedToken = parseJwt(id_token);
	console.log("ID Token Decoded", decodedToken);
	localStorage.setItem("google_id", decodedToken.sub);
	localStorage.setItem("google_name", decodedToken.given_name);
	localStorage.setItem("cart", JSON.stringify([]));
	localStorage.setItem("google_email", decodedToken.email);
	// Example: Display the user's name
	greeting(decodedToken.given_name);
	window.location.reload();
	// alert("Hello, " + decodedToken.name);
}

function greeting(name) {
	document.getElementById("greeting").textContent = "Welcome, " + name + "!";
}
// Helper function to decode the ID token
function parseJwt(token) {
	var base64Url = token.split(".")[1];
	var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
	var jsonPayload = decodeURIComponent(
		atob(base64)
			.split("")
			.map(function (c) {
				return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
			})
			.join("")
	);

	return JSON.parse(jsonPayload);
}

function checkLoginState() {
	if (localStorage.getItem("google_id")) {
		// User is already logged in
		// Perform actions accordingly, e.g., hide login button, show sign-out button
		return true;
	}
	return false;
}

function signOut() {
	console.log(111);
	google.accounts.id.revoke(localStorage.getItem("google_id"), (done) => {
		console.log("Access revoked");
		localStorage.removeItem("google_id");
		localStorage.removeItem("google_name");
		localStorage.removeItem("google_email");
		// Optional: Update UI to reflect sign-out state
		// ...

		// Redirect or refresh page after sign-out
		document.getElementById("signOutButton").style.display = "none";
		localStorage.setItem("cart", JSON.stringify([]));
		window.location.reload();
		// window.location.reload(); or window.location.href = 'homepage.html';
	});
}

function getStoredZoomLevel() {
	var storedZoomLevel = localStorage.getItem("zoomLevel");
	return storedZoomLevel ? parseFloat(storedZoomLevel) : 1;
}

// Function to set the zoom level
function setZoomLevel(zoomLevel) {
	document.body.style.transform = "scale(" + zoomLevel + ")";
}
