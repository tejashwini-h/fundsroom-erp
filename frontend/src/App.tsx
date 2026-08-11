import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Products from "./pages/Products";
import Inventory from "./pages/Inventory";
import Challans from "./pages/Challans";
import MainLayout from "./layouts/MainLayout";

import "./App.css";

function App() {
  const token = localStorage.getItem(
    "fundsroom_token"
  );

  return (
    <BrowserRouter>
      <Routes>

        {/* Login */}
        <Route
          path="/login"
          element={
            token ? (
              <Navigate
                to="/"
                replace
              />
            ) : (
              <Login />
            )
          }
        />

        {/* Protected Application */}
        <Route
          element={
            token ? (
              <MainLayout />
            ) : (
              <Navigate
                to="/login"
                replace
              />
            )
          }
        >

          {/* Dashboard */}
          <Route
            path="/"
            element={<Dashboard />}
          />

          {/* Customers */}
          <Route
            path="/customers"
            element={<Customers />}
          />

          {/* Products */}
          <Route
            path="/products"
            element={<Products />}
          />

          {/* Inventory */}
          <Route
            path="/inventory"
            element={<Inventory />}
          />

          {/* Challans */}
          <Route
            path="/challans"
            element={<Challans />}
          />

        </Route>

        {/* Unknown route */}
        <Route
          path="*"
          element={
            <Navigate
              to={token ? "/" : "/login"}
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;