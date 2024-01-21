document.addEventListener('DOMContentLoaded', function() {
    fetch("/get_table?name=inventory")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then((data) => {
            let tableHead = document.getElementById("inventoryTableHead");
            let tableBody = document.getElementById("inventoryTableBody");

            if (data.length > 0) {
                let headers = Object.keys(data[0]);
                let headerRow = document.createElement("tr");

                headers.forEach((header, index) => {
                    let th = document.createElement("th");
                    th.textContent = header;
                    th.setAttribute('onclick', `sortTable(${index})`);
                    headerRow.appendChild(th);
                });

                tableHead.appendChild(headerRow);

                data.forEach((item) => {
                    let row = document.createElement("tr");

                    for (let key in item) {
                        let cell = document.createElement("td");
                        cell.textContent = item[key];
                        row.appendChild(cell);
                    }

                    tableBody.appendChild(row);
                });
            } else {
                alert("Inventory is currently empty!");
            }
        })
        .catch((error) => {
            console.log("There was a problem with the fetch operation:", error.message);
        });

    window.sortTable = function(n) {
        var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
        table = document.getElementById("interactiveTable");
        switching = true;
        dir = "asc"; 
        while (switching) {
            switching = false;
            rows = table.rows;
            for (i = 1; i < (rows.length - 1); i++) {
                shouldSwitch = false;
                x = rows[i].getElementsByTagName("TD")[n];
                y = rows[i + 1].getElementsByTagName("TD")[n];
                if ((dir === "asc" && x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) || (dir === "desc" && x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase())) {
                    shouldSwitch = true;
                    break;
                }
            }
            if (shouldSwitch) {
                rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                switching = true;
                switchcount++;
            } else {
                if (switchcount === 0 && dir === "asc") {
                    dir = "desc";
                    switching = true;
                }
            }
        }
    };

    window.filterTable = function() {
        var input, filter, table, tr, td, i, txtValue;
        input = document.getElementById("searchInput");
        filter = input.value.toUpperCase();
        table = document.getElementById("interactiveTable");
        tr = table.getElementsByTagName("tr");
        for (i = 1; i < tr.length; i++) {
            td = tr[i].getElementsByTagName("td")[0];
            if (td) {
                txtValue = td.textContent || td.innerText;
                if (txtValue.toUpperCase().indexOf(filter) > -1) {
                    tr[i].style.display = "";
                } else {
                    tr[i].style.display = "none";
                }
            }
        }
    };


    // JavaScript to open and close the popup
    function openAddEntryPopup() {
        const addEntryPopup = document.getElementById("addEntryPopup");
        addEntryPopup.style.display = "block";
    }

    function closeAddEntryPopup() {
        const addEntryPopup = document.getElementById("addEntryPopup");
        addEntryPopup.style.display = "none";
    }

    // Trigger the "Add Entry" popup when the button is clicked
    const addEntryButton = document.querySelector(".addEntryButton");
    addEntryButton.addEventListener("click", openAddEntryPopup);

    // Handle form submission
    const addEntryForm = document.getElementById("addEntryForm");
    addEntryForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        // Retrieve input values
        const ingredient_name = document.getElementById("ingredient").value;
        const quantity_num = parseInt(document.getElementById("quantity").value);
        const restockQuantity_num = parseInt(document.getElementById("restock_quantity").value);
        const minQuantity_num = parseInt(document.getElementById("min_quantity").value);


        
            // Create a request payload as an object
            const requestPayload = {
                ingredient: ingredient_name,
                quantity: quantity_num,
                restockQuantity: restockQuantity_num,
                minQuantity: minQuantity_num,
            };

            // Make an HTTP POST request to your server to insert a new menu item
            fetch("/insert_inventory", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestPayload),
            })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                // Handle the response from the server
                console.log("Inventory item added successfully:", data);
            })
            .catch((error) => {
                // Handle network errors, fetch errors, or any other unexpected errors
                console.error("Error while adding inventory item:", error);
            });
        closeAddEntryPopup();
    });


    function openRemoveEntryPopup() {
        const removeEntryPopup = document.getElementById("removeEntryPopup");
        removeEntryPopup.style.display = "block";
    }
    
    function closeRemoveEntryPopup() {
        const removeEntryPopup = document.getElementById("removeEntryPopup");
        removeEntryPopup.style.display = "none";
    }
    
    const removeEntryForm = document.getElementById("removeEntryForm");
    removeEntryForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        const ingredient_name = document.getElementById("removeName").value;
    
        // Send a request to your server to remove the menu item
        fetch("/remove_inventory", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ingredient_name: ingredient_name,
            }),
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then((data) => {
            // Handle the response from the server
            console.log("inventory item removed successfully:", data);
            // Optionally, you can update the menu table here to reflect the changes.
        })
        .catch((error) => {
            // Handle network errors, fetch errors, or any other unexpected errors
            console.error("Error while removing inventory item:", error);
        });
    
        closeRemoveEntryPopup();
    });
    
    const removeEntryButton = document.querySelector(".removeEntryButton");
    removeEntryButton.addEventListener("click", openRemoveEntryPopup);

    // Add an event listener for the "Update Entry" button
    const updateEntryButton = document.querySelector(".updateEntryButton");
    updateEntryButton.addEventListener("click", openUpdateEntryPopup);

    // Function to open the "Update Entry" popup
    function openUpdateEntryPopup() {
        const updateEntryPopup = document.getElementById("updateEntryPopup");
        updateEntryPopup.style.display = "block";
    }

    // Function to close the "Update Entry" popup
    function closeUpdateEntryPopup() {
        const updateEntryPopup = document.getElementById("updateEntryPopup");
        updateEntryPopup.style.display = "none";
    }


    // Function to handle the form submission for updating an entry
    const updateEntryForm = document.getElementById("updateEntryForm");
    updateEntryForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        // Retrieve input values
        const ingredient_name = document.getElementById("updateName").value;
        const quantity_num = parseInt(document.getElementById("updateQuantity").value);
        const restockQuantity_num = parseInt(document.getElementById("updateRestockQuantity").value);


        
            // Create a request payload as an object
            const requestPayload = {
                ingredient: ingredient_name,
                quantity: quantity_num,
                restockQuantity: restockQuantity_num,
            };

        try {
            // Make an HTTP POST request to your server to update the menu item
            const response = await fetch("/update_inventory", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestPayload),
            });

            if (response.ok) {
                // Menu item updated successfully
                console.log("Inventory item updated successfully.");
            } else {
                // Handle errors (e.g., response status is not OK)
                console.error("Failed to update inventory item.");
            }
        } catch (error) {
            // Handle network errors, fetch errors, or any other unexpected errors
            console.error("Error while updating inventory item:", error);
        }

        closeUpdateEntryPopup();
    });


    
});
