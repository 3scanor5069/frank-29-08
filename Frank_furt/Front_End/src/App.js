// src/App.js
import './index.css'; // o './App.css' dependiendo del nombre que usas
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PaginaPrincipal from './pages/PaginaPrincipal';
import Login from './pages/Login';
import Register from './pages/Register';
import AboutPage from './pages/AboutPage';
import MenuPage from './pages/MenuPage';
import Restablecer from './pages/Restablecer';
import Ubications from './components/Ubications';
import MenuDetail from './pages/MenuDetail';
import CartPage from './pages/CartPage'; 
import { CartProvider } from './context/CartContext';
import TeamPage from './pages/TeamPage';
import ServicesPage from './pages/ServicesPage';
import FoodChainDashboard from './Administrador/dashboard';
import MenuCrud from './Administrador/MenuCrud';
import UsersCrud from './Administrador/UsersCrud';
import InventoryCrud from './Administrador/InventoryCrud';
import MiPerfil from './pages/MiPerfil';
import EditarPerfil from './components/Editarperfil';
import SeleccionMesas from './pages/SeleccionMesas';
import RegistroOrden from './pages/RegistroOrden';
import DashboardBar from './components/DashboardBar';
import RestaurantOrders from './Administrador/RestaurantOrders';
import InventoryHistory from './Administrador/InventoryHistory';







function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<FoodChainDashboard />} />
          <Route path="/UsersCrud" element={<UsersCrud />} />
          <Route path="/MenuCrud" element={<MenuCrud />} />
          <Route path="/InventoryCrud" element={<InventoryCrud />} />
          <Route path="/p" element={<PaginaPrincipal />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Register" element={<Register />} />
          <Route path="/Restablecer" element={<Restablecer />} />
          <Route path="/Ubications" element={<Ubications />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/menu/:id" element={<MenuDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/equipo" element={<TeamPage />} />
          <Route path="/servicios" element={<ServicesPage />} />
          <Route path="/MiPerfil" element={<MiPerfil />} />
          <Route path="/EditarPerfil" element={<EditarPerfil />} />
          <Route path="/SeleccionMesas" element={<SeleccionMesas />} />
          <Route path="/RegistroOrden" element={<RegistroOrden />} />
          <Route path="/DashboardBar" element={<DashboardBar />} />
          <Route path="/RestaurantOrders" element={<RestaurantOrders />} />
          <Route path="/InventoryHistory" element={<InventoryHistory />} />



        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
