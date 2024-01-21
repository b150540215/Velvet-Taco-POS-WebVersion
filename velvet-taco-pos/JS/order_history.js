document.addEventListener('DOMContentLoaded', function() {
    fetch("/get_table?name=orders")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then((data) => {
            let tableHead = document.getElementById("ordersTableHead");
            let tableBody = document.getElementById("ordersTableBody");

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
                alert("Order History is currently empty!");
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
});
