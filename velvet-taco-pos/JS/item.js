async function loadCategories() {
	try {
		const response = await fetch("/getCategoryofMenu");
		const categories = await response.json();
		const container = document.getElementById("categoryContainer");
		// Clear out any existing content
		container.innerHTML = "";
		// Generate new content
		categories.forEach((category) => {
			container.innerHTML += createCategoryButton(category.type);
		});
	} catch (error) {
		console.error("Error loading categories:", error);
	}
}

function createCategoryButton(categoryName) {
	return `
        <a href="customermenu.html?category=${encodeURIComponent(
					categoryName
				)}" class="grid-item" style="background-image: url('../pictures/${categoryName}.jpg'); background-size: cover; background-position: center; background-repeat: no-repeat;"">
            <div class="grid-content">${categoryName}</div>
        </a>
    `;
}

loadCategories();
