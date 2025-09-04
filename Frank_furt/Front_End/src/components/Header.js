import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import MiPerfil from '../pages/MiPerfil';
import {
   FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram,
  FaBars, FaTimes, FaUser, FaShoppingCart, 
} from 'react-icons/fa';
import { Crown } from 'lucide-react';

import '../styles/Header.css';

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userAuthMenuOpen, setUserAuthMenuOpen] = useState(false);
  const [avatarVisible, setAvatarVisible] = useState(false);
  const location = useLocation();

  // Simulación del estado de autenticación - en una app real esto vendría de un contexto o estado global
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Cambiado a true para mostrar el nuevo diseño
  const [user] = useState({
    name: 'Carlos Rivera',
    email: 'carlos@frankfurt.com'
  });

  // Animación del avatar al cargar
  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        setAvatarVisible(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  const handleLinkClick = () => {
    setMobileOpen(false);
    setOpenDropdown(null);
    setUserMenuOpen(false);
    setUserAuthMenuOpen(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserAuthMenuOpen(false);
    setAvatarVisible(false);
  };

  const getMenuLink = (section) => {
    return location.pathname === '/menu' ? `#${section}` : `/menu#${section}`;
  };

  const getUserInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <header className={`header ${isAuthenticated ? 'header-authenticated' : ''}`}>
      {/* Contact Bar */}
      <div className="contact-bar">
        <div className="container">
          <div className="social-links">
            <span className="social-text">Síguenos:</span>
            <div className="social-icons">
              <a href="#" className="social-link"><FaFacebookF /></a>
              <a href="#" className="social-link"><FaTwitter /></a>
              <a href="#" className="social-link"><FaLinkedinIn /></a>
              <a href="#" className="social-link"><FaInstagram /></a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="main-nav">
        <div className="container">
          <div className="nav-content">
            {/* Logo Section */}
            <div className="brand">
              <div className="logo-container">
                 <div className="login-icon">
                    <Crown className="icon" />
                 </div>
                <div className="brand-text">
                  <h1 className="brand-name">FRANK FURT</h1>
                  <span className="brand-subtitle">Comidas Rápidas</span>
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <div className={`nav-wrapper ${mobileOpen ? 'nav-open' : ''}`}>
              <ul className="nav-menu">
                <li className="nav-item">
                  <Link 
                    to="/" 
                    className={`nav-link ${isActiveLink('/') ? 'active' : ''}`} 
                    onClick={handleLinkClick}
                  >
                    Inicio
                  </Link>
                </li>
                
                <li 
                  className={`nav-item dropdown ${openDropdown === 'pages' ? 'active' : ''}`}
                  onMouseEnter={() => setOpenDropdown('pages')}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <span className="nav-link">Páginas</span>
                  <ul className="dropdown-menu">
                    <li><Link to="/about" onClick={handleLinkClick}>Nosotros</Link></li>
                    <li><Link to="/equipo" onClick={handleLinkClick}>Equipo</Link></li>
                    <li><Link to="/servicios" onClick={handleLinkClick}>Servicios</Link></li>
                  </ul>
                </li>

                <li 
                  className={`nav-item dropdown ${openDropdown === 'menu' ? 'active' : ''}`}
                  onMouseEnter={() => setOpenDropdown('menu')}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link 
                    to="/menu" 
                    className={`nav-link ${isActiveLink('/menu') ? 'active' : ''}`} 
                    onClick={handleLinkClick}
                  >
                    Menú
                  </Link>
                  <ul className="dropdown-menu">
                    <li><a href={getMenuLink('entradas')} onClick={handleLinkClick}>Entradas</a></li>
                    <li><a href={getMenuLink('platosprincipales')} onClick={handleLinkClick}>Platos Principales</a></li>
                    <li><a href={getMenuLink('postres')} onClick={handleLinkClick}>Postres</a></li>
                    <li><a href={getMenuLink('bebidas')} onClick={handleLinkClick}>Bebidas</a></li>
                  </ul>
                </li>

                <li className="nav-item">
                  <Link 
                    to="/Ubications" 
                    className={`nav-link ${isActiveLink('/Ubications') ? 'active' : ''}`} 
                    onClick={handleLinkClick}
                  >
                    Ubicaciones
                  </Link>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="nav-actions">
              <Link to="/cart" className="cart-btn">
                <FaShoppingCart />
                <span className="cart-count">0</span>
              </Link>

              {/* Menú de usuario condicional */}
              {isAuthenticated ? (
                // Usuario autenticado - Nuevo diseño inspirado en Epic Games
                <div className={`user-authenticated epic-style ${userAuthMenuOpen ? 'active' : ''} ${avatarVisible ? 'visible' : ''}`}
                     onMouseEnter={() => setUserAuthMenuOpen(true)}
                     onMouseLeave={() => setUserAuthMenuOpen(false)}
                >
                  <div className="user-avatar-epic">
                    <div className="avatar-ring"></div>
                    <div className="avatar-content">
                      {getUserInitial(user.name)}
                    </div>
                    <div className="user-status-indicator"></div>
                  </div>
                  
                  <div className="user-epic-dropdown">
                    <div className="dropdown-header">
                      <div className="user-info">
                        <span className="user-name">{user.name}</span>
                        <span className="user-email">{user.email}</span>
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <ul className="dropdown-items">
                      <li><Link to="/mis-pedidos" onClick={handleLinkClick}>Mis Pedidos</Link></li>
                      <li><Link to="/recompensas" onClick={handleLinkClick}>Recompensas</Link></li>
                      <li><Link to="/monedero" onClick={handleLinkClick}>Monedero</Link></li>
                      <li><Link to="/cupones" onClick={handleLinkClick}>Cupones</Link></li>
                      <li><Link to="/MiPerfil" onClick={handleLinkClick}>Mi Cuenta</Link></li>
                      <li><Link to="/canjear" onClick={handleLinkClick}>Canjear Código</Link></li>
                      <li><Link to="/favoritos" onClick={handleLinkClick}>Favoritos</Link></li>
                    </ul>
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-footer">
                      <button className="logout-btn" onClick={handleLogout}>
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // Usuario no autenticado - Menú tradicional
                <div 
                  className={`user-menu ${userMenuOpen ? 'active' : ''}`}
                  onMouseEnter={() => setUserMenuOpen(true)}
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  <button className="user-btn">
                    <FaUser />
                  </button>
                  <div className="user-dropdown">
                    <Link to="/login" onClick={handleLinkClick}>Iniciar Sesión</Link>
                    <Link to="/register" onClick={handleLinkClick}>Registrarse</Link>
                  </div>
                </div>
              )}

              <button 
                className="mobile-toggle"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <FaTimes /> : <FaBars />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="mobile-overlay" onClick={() => setMobileOpen(false)}>
          <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-header">
              <h3>Menú</h3>
              <button onClick={() => setMobileOpen(false)}>
                <FaTimes />
              </button>
            </div>
            <ul className="mobile-nav">
              <li><Link to="/" onClick={handleLinkClick}>Inicio</Link></li>
              <li><Link to="/about" onClick={handleLinkClick}>Nosotros</Link></li>
              <li><Link to="/equipo" onClick={handleLinkClick}>Equipo</Link></li>
              <li><Link to="/servicios" onClick={handleLinkClick}>Servicios</Link></li>
              <li><Link to="/menu" onClick={handleLinkClick}>Menú</Link></li>
              <li><Link to="/Ubications" onClick={handleLinkClick}>Ubicaciones</Link></li>
              <li><Link to="/contact" onClick={handleLinkClick}>Contacto</Link></li>
            </ul>
            <div className="mobile-actions">
              {isAuthenticated ? (
                <>
                  <div className="mobile-user-info epic-mobile">
                    <div className="mobile-avatar">
                      {getUserInitial(user.name)}
                    </div>
                    <span>Hola, {user.name}</span>
                  </div>
                  <button className="mobile-btn logout-mobile" onClick={handleLogout}>
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="mobile-btn" onClick={handleLinkClick}>
                    Iniciar Sesión
                  </Link>
                  <Link to="/order" className="mobile-btn primary" onClick={handleLinkClick}>
                    Pedir Ahora
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;