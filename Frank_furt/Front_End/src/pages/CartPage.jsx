import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/CartPage.css';

const initialCart = [
  {
    id: 1,
    title: 'Lasaña de carne',
    description: 'Lasaña clásica con salsa casera.',
    price: 13700,
    image: 'https://cdn.colombia.com/gastronomia/2015/06/09/lasana-de-carne-y-queso-2977.jpg',
    quantity: 1,
  },
  {
    id: 2,
    title: 'Limonada fresca',
    description: 'Hecho en casa con limones reales.',
    price: 3200,
    image: 'https://peopleenespanol.com/thmb/em83Twz8Upw0ktCiE09nKqnu-SY=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/8714519b-06f8-4298-b9b0-d4137486666e-489367376f8f49f28aaf0d7e67a8f90c.jpg',
    quantity: 2,
  },
];

const CartPage = () => {
  const [cart, setCart] = useState(initialCart);

  const increment = (id) => {
    setCart(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decrement = (id) => {
    setCart(prev =>
      prev.map(item =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const removeItem = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div id="cart-wrapper">
      <Header />
      <main id="cart-content">
        <h1 id="cart-title">🛒 Tu carrito</h1>
        {cart.length === 0 ? (
          <p id="cart-empty">Tu carrito está vacío.</p>
        ) : (
          <div id="cart-items">
            {cart.map((item) => (
              <div key={item.id} className="cart-card">
                <img src={item.image} alt={item.title} className="cart-img" />
                <div className="cart-info">
                  <h2 className="cart-item-title">{item.title}</h2>
                  <p className="cart-item-desc">{item.description}</p>
                  <span className="cart-item-price">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                  <div className="cart-quantity-controls">
                    <button onClick={() => decrement(item.id)} className="cart-btn">-</button>
                    <span className="cart-qty">{item.quantity}</span>
                    <button onClick={() => increment(item.id)} className="cart-btn">+</button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="cart-remove-btn"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
            <div id="cart-total">
              <h3>Total:</h3>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CartPage;
