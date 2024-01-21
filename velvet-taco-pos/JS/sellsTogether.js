document.getElementById("sellsTogether").addEventListener("click", function () {
	const startDate = document.getElementById("reportStartDateInput").value;
	const endDate = document.getElementById("reportEndDateInput").value;
	if (!startDate || !endDate) {
		alert("Please enter a correct date!");
		return;
	}
	fetch(`/what_sells_together?startDate=${startDate}&endDate=${endDate}`)
		.then((response) => {
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			return response.json();
		})
		.then((data) => {
			// Check if data isn't empty, create the table headers based on the keys of the first object
			if (data.length > 0) {
				const ul = document.getElementById("sellsTogetherItems");
				ul.innerHTML = "";
				// Populate the table body with data
				data.forEach((row) => {
					const li = document.createElement("li");
					li.textContent = row;
					ul.appendChild(li);
				});
			} else {
				alert("No items that sell together");
				return;
			}
		})
		.catch((error) => {
			console.log(
				"There was a problem with the fetch operation:",
				error.message
			);
		});
});
