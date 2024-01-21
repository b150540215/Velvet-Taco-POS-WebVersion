import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import AdminPage from "./routes/AdminPage";
import CashierPage from "./routes/CashierPage";
import Home from "./routes/Home";
import ManagerPage from "./routes/ManagerPage";
import PageNotFound from "./routes/PageNotFound";
import { UserProvider } from "./routes/UserContext";

const App = () => {
	return (
		<div className="container-fluid">
			<Router>
				<UserProvider>
					<Routes>
						<Route exact path="/" element={<Home />} />
						<Route exact path="/manager" element={<ManagerPage />} />
						<Route exact path="/cashier" element={<CashierPage />} />
						<Route exact path="/admin" element={<AdminPage />} />
						<Route exact path="*" element={<PageNotFound />} />
					</Routes>
				</UserProvider>
			</Router>
		</div>
	);
};

export default App;
