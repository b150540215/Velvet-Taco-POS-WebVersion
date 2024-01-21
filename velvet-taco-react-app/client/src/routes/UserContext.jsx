import React, { createContext, useContext, useState } from "react";

const UserContext = createContext(null);

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
	const [user, setUser] = useState(() => {
		// Check for user data in local storage
		const storedUserData = localStorage.getItem("user");
		return storedUserData ? JSON.parse(storedUserData) : null;
	});

	const login = (userData) => {
		setUser(userData);
		// You can also store the user data in local storage or cookies here
		localStorage.setItem("user", JSON.stringify(userData));
	};

	const logout = () => {
		setUser(null);
		// Also, clear the stored user data from local storage or cookies
		localStorage.removeItem("user");
	};

	return (
		<UserContext.Provider value={{ user, login, logout }}>
			{children}
		</UserContext.Provider>
	);
};

export default UserContext;
