import React, { useState, useEffect } from 'react';
import './ManualSale.css';

const ManualSale = () => {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [mesaSeleccionada, setMesaSeleccionada] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');

  // Datos mockeados de mesas
  const mesas = [
    { id: 1, numero: 'Mesa 1' },
    { id: 2, numero: 'Mesa 2' },
    { id: 3, numero: 'Mesa 3' },
    { id: 4, numero: 'Mesa 4' },
    { id: 5, numero: 'Mesa 5' },
    { id: 6, numero: 'Mesa 6' },
    { id: 7, numero: 'Mesa 7' },
    { id: 8, numero: 'Mesa 8' }
  ];

  // Cargar productos al montar el componente
  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const response = await fetch('/api/menu');
      const data = await response.json();
      setProductos(data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setMensaje('Error al cargar los productos');
    }
  };

  const agregarAlCarrito = (producto) => {
    const productoExistente = carrito.find(item => item.idProducto === producto.idProducto);
    
    if (productoExistente) {
      setCarrito(carrito.map(item =>
        item.idProducto === producto.idProducto
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      setCarrito([...carrito, {
        idProducto: producto.idProducto,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: 1
      }]);
    }
  };

  const modificarCantidad = (idProducto, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      eliminarDelCarrito(idProducto);
    } else {
      setCarrito(carrito.map(item =>
        item.idProducto === idProducto
          ? { ...item, cantidad: nuevaCantidad }
          : item
      ));
    }
  };

  const eliminarDelCarrito = (idProducto) => {
    setCarrito(carrito.filter(item => item.idProducto !== idProducto));
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  const confirmarPedido = async () => {
    if (!mesaSeleccionada) {
      setMensaje('Por favor selecciona una mesa');
      return;
    }

    if (carrito.length === 0) {
      setMensaje('El carrito está vacío');
      return;
    }

    setLoading(true);
    try {
      const pedidoData = {
        idMesa: parseInt(mesaSeleccionada),
        productos: carrito.map(item => ({
          idProducto: item.idProducto,
          cantidad: item.cantidad
        }))
      };

      const response = await fetch('/api/ventas/manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pedidoData)
      });

      const result = await response.json();

      if (response.ok) {
        setMensaje('Pedido registrado exitosamente');
        setCarrito([]);
        setMesaSeleccionada('');
      } else {
        setMensaje(result.error || 'Error al registrar el pedido');
      }
    } catch (error) {
      console.error('Error:', error);
      setMensaje('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="manual-sale-container">
      <div className="manual-sale-header">
        <h1>Venta Manual - Frank Furt</h1>
        <div className="mesa-selector">
          <label htmlFor="mesa">Seleccionar Mesa:</label>
          <select
            id="mesa"
            value={mesaSeleccionada}
            onChange={(e) => setMesaSeleccionada(e.target.value)}
          >
            <option value="">Selecciona una mesa</option>
            {mesas.map(mesa => (
              <option key={mesa.id} value={mesa.id}>
                {mesa.numero}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="manual-sale-content">
        <div className="productos-section">
          <h2>Productos Disponibles</h2>
          <div className="productos-grid">
            {productos.map(producto => (
              <div key={producto.idProducto} className="producto-card">
                <h3>{producto.nombre}</h3>
                <p className="precio">${producto.precio.toLocaleString()}</p>
                <button
                  className="btn-agregar"
                  onClick={() => agregarAlCarrito(producto)}
                >
                  Agregar
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="carrito-section">
          <h2>Pedido Actual</h2>
          {carrito.length === 0 ? (
            <p className="carrito-vacio">El carrito está vacío</p>
          ) : (
            <div>
              <div className="carrito-items">
                {carrito.map(item => (
                  <div key={item.idProducto} className="carrito-item">
                    <div className="item-info">
                      <h4>{item.nombre}</h4>
                      <p>${item.precio.toLocaleString()}</p>
                    </div>
                    <div className="cantidad-controls">
                      <button
                        onClick={() => modificarCantidad(item.idProducto, item.cantidad - 1)}
                      >
                        -
                      </button>
                      <span>{item.cantidad}</span>
                      <button
                        onClick={() => modificarCantidad(item.idProducto, item.cantidad + 1)}
                      >
                        +
                      </button>
                    </div>
                    <div className="item-subtotal">
                      ${(item.precio * item.cantidad).toLocaleString()}
                    </div>
                    <button
                      className="btn-eliminar"
                      onClick={() => eliminarDelCarrito(item.idProducto)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="carrito-total">
                <h3>Total: ${calcularTotal().toLocaleString()}</h3>
              </div>

              <button
                className="btn-confirmar"
                onClick={confirmarPedido}
                disabled={loading || !mesaSeleccionada}
              >
                {loading ? 'Procesando...' : 'Confirmar Pedido'}
              </button>
            </div>
          )}
        </div>
      </div>

      {mensaje && (
        <div className={`mensaje ${mensaje.includes('Error') ? 'error' : 'exito'}`}>
          {mensaje}
          <button onClick={() => setMensaje('')}>✕</button>
        </div>
      )}
    </div>
  );
};

export default ManualSale;