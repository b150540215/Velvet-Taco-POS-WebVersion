document.getElementById("restock_report").addEventListener("click", function () {
// Fetch the restock report from the server
fetch("/restock_report")
    .then(response => {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return response.json();
    })
    .then(data => {
        // Populate the list in the HTML with the restock items
        const restockList = document.getElementById("restockList");
        data.forEach(item => {
            const listItem = document.createElement("li");
            listItem.textContent = item;
            restockList.appendChild(listItem);
        });
    })
    .catch(error => {
        console.error("There was a problem with the fetch operation:", error);
    });
});
