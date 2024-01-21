document.getElementById("submit").addEventListener("click", function () {
    const startDate = document.getElementById("reportStartDateInput").value;
    const endDate = document.getElementById("reportEndDateInput").value;

    if (!startDate || !endDate) {
        alert("Please enter a correct date!");
        return;
    }
    fetch(`/get_product_usage_data?startDate=${startDate}&endDate=${endDate}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                // Clear previous data
                usageData.innerHTML = "";

                // Process the data and display it on the page
                const usageTable = document.createElement("table");
                const tableHeader = document.createElement("thead");
                const tableBody = document.createElement("tbody");

                // Create table headers
                const headerRow = document.createElement("tr");
                const headerIngredient = document.createElement("th");
                headerIngredient.textContent = "Ingredient";
                const headerCount = document.createElement("th");
                headerCount.textContent = "Count";

                headerRow.appendChild(headerIngredient);
                headerRow.appendChild(headerCount);
                tableHeader.appendChild(headerRow);

                // Populate the table with data
                for (const ingredient in data) {
                    const rowData = data[ingredient];

                    const row = document.createElement("tr");
                    const cellIngredient = document.createElement("td");
                    cellIngredient.textContent = ingredient;
                    const cellCount = document.createElement("td");
                    cellCount.textContent = rowData;

                    row.appendChild(cellIngredient);
                    row.appendChild(cellCount);
                    tableBody.appendChild(row);
                }

                usageTable.appendChild(tableHeader);
                usageTable.appendChild(tableBody);
                usageData.appendChild(usageTable);
            })
            .catch((error) => {
                console.error("Error fetching and displaying data:", error);
            });
});



