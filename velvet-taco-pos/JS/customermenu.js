document.addEventListener("DOMContentLoaded", function () {
    // Retrieve zoom level from local storage on page load
    var storedZoomLevel = localStorage.getItem("zoomLevel");
    var zoomLevel = storedZoomLevel ? parseFloat(storedZoomLevel) : 1;

    // Apply the initial zoom level
    document.body.style.transform = "scale(" + zoomLevel + ")";
  });
  
async function openPopup(itemName) {
    let priceValue = "Unavailable";
    let caloriesValue = "Unavailable";
    let ingredientsList = [];

    try {
        const priceresponse = await fetch(
            `/getItemPrice?item=${encodeURIComponent(itemName)}`
        );
        const pricedata = await priceresponse.json();
        priceValue = pricedata[0].price;

        const ingredientsResponse = await fetch(
            `/getItemIngredients?item=${encodeURIComponent(itemName)}`
        );

        if (ingredientsResponse.ok) {
            const ingredientsData = await ingredientsResponse.json();

            if (ingredientsData.length > 0) {
                ingredientsList = ingredientsData.map(
                    (ingredientObj) => ingredientObj.ingredient
                );
            }
        }

        const caloriesresponse = await fetch(
            `/getItemCalories?item=${encodeURIComponent(itemName)}`
        );
        const caloriesdata = await caloriesresponse.json();
        caloriesValue = caloriesdata[0].calories;
    } catch (error) {
        console.error("Error loading menu items:", error);
    }

    let ingredientsText = "";
    if (ingredientsList.length > 0) {
        ingredientsText = ingredientsList
            .map(
                (ingredient) => `
                <label>
                    <input type="checkbox" class="ingredient-checkbox" value="${ingredient}" checked />
                    ${ingredient}
                </label>
            `
            )
            .join("");
    } else {
        ingredientsText = "Unavailable";
    }

    let popupContent = `
    <h3>${itemName}</h3>
    <p><strong>Price:</strong> $${priceValue}</p>
    <p><strong>Ingredients:</strong></p>
    <div id="ingredients-checkboxes">${ingredientsText}</div>
    <p><strong>Calories:</strong> ${caloriesValue}</p>
    `;

    const popupContainer = document.getElementById("popup-content");
    popupContainer.innerHTML = popupContent;

    // Create the Add to Cart button with stylized class
    const addToCartButton = document.createElement("button");
    addToCartButton.className = "add-to-cart-btn"; // This class should be defined in your CSS
    addToCartButton.textContent = "Add to Cart";
    addToCartButton.addEventListener("click", function () {
        addToCart(itemName);
    });

    popupContainer.appendChild(addToCartButton);

    document.getElementById("popup").classList.remove("shrink");
    document.getElementById("popup").style.display = "block";
}


function closePopup() {
    const popup = document.getElementById("popup");
    popup.classList.add("shrink");
    // Use setTimeout to hide the popup after the animation completes
    setTimeout(() => { popup.style.display = "none"; }, 300);
}


async function loadMenuItems(category) {
	try {
		const response = await fetch(`/getItemsOfCategory?category=${category}`);
		const items = await response.json();
		const container = document.getElementById("menuItemsContainer");
		container.innerHTML = ""; // Clear existing content
		items.forEach((item) => {
			container.appendChild(createMenuItemButton(item));
		});
	} catch (error) {
		console.error("Error loading menu items:", error);
	}
}

function createMenuItemButton(item) {
	const button = document.createElement("button");
	button.className = "grid-item";

	// Replace apostrophes and slashes in the item name
	let imageName = item.name.replace(/'/g, "_"); //server can't process ' in jpg file name for some reason.
	imageName = imageName.replace(/\//g, "_"); //file name cannot contain /, so all / were changed to _

	// Encode the imageName for use in the URL
	const encodedImageName = encodeURIComponent(imageName);
	button.style.backgroundImage = `url('../pictures/${encodedImageName}.jpg')`;

	button.style.backgroundSize = "cover"; // Cover the entire area of the button
	button.style.backgroundPosition = "center"; // Center the image within the button
	button.style.backgroundRepeat = "no-repeat"; // Do not repeat the image
	button.onclick = function () {
		openPopup(item.name);
	};

	const div = document.createElement("div");
	div.className = "grid-content";
	div.textContent = item.name;

	button.appendChild(div);
	return button;
}

function getCategoryFromURL() {
	const queryParams = new URLSearchParams(window.location.search);
	return queryParams.get("category");
}

const category = getCategoryFromURL();
if (category) {
	loadMenuItems(category);
} else {
	// Handle the case where no category is provided
}


function addToCart(itemName) {
    // Assuming you have a function to get your cart from Local Storage
	console.log(itemName);
    let cart = getCart();
    let item = { name: itemName, /* other item properties */ };
	const itemIndex = cart.findIndex(item => item.name === itemName);
	if(itemIndex === -1){
    	cart.push(item);
		const itemIndex2 = cart.findIndex(item => item.name === itemName);
		cart[itemIndex2].quantity = 1;
	}
	else{
		cart[itemIndex].quantity = cart[itemIndex].quantity+1;
	}
    updateLocalStorage(cart); // Save the updated cart to Local Storage

    alert(`${itemName} added to cart`); // Optional: Show confirmation
	closePopup();

    // Reload the page
    location.reload()
}

function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function updateLocalStorage(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}