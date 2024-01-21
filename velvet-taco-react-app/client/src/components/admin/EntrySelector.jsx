import React, { useContext } from "react";
import { AdminContext } from "../../context/AdminContext";

function EntrySelector() {
	const { viewEntriesCount, setViewEntriesCount } = useContext(AdminContext);

	const handleViewChange = (e) => {
		setViewEntriesCount(e.target.value);
	};

	return (
		<select
			className="custom-select my-1 mr-sm-2"
			style={{ width: 70, height: 40 }}
			onChange={handleViewChange}
			value={viewEntriesCount}
		>
			<option value={10}>10</option>
			<option value={25}>25</option>
			<option value={50}>50</option>
			<option value={100}>100</option>
			{/* <option value={500}>500</option>
      <option value={1000}>1000</option> */}
			<option value={-1}>all</option>
		</select>
	);
}

export default EntrySelector;
