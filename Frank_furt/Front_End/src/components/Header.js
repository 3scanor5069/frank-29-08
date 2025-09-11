import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram,
  FaBars, FaTimes, FaUser, FaShoppingCart, 
} from 'react-icons/fa';
import { Crown } from 'lucide-react';

import '../styles/Header.css';

const Header = () => {
  // Estados simplificados y consolidados
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [avatarVisible, setAvatarVisible] = useState(false);

  // Referencias para manejo de hover con delay
  const userMenuRef = useRef(null);
  const userMenuTimeoutRef = useRef(null);

  const location = useLocation();

  // Estado de autenticación simulado
  const [isAuthenticated, setIsAuthenticated] = useState(true);
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

  // Cleanup de timeouts al desmontar
  useEffect(() => {
    return () => {
      if (userMenuTimeoutRef.current) {
        clearTimeout(userMenuTimeoutRef.current);
      }
    };
  }, []);

  // Manejadores de eventos simplificados
  const handleLinkClick = () => {
    setMobileOpen(false);
    setOpenDropdown(null);
    setUserMenuOpen(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserMenuOpen(false);
    setAvatarVisible(false);
  };

  // Manejo mejorado del menú de usuario con delay
  const handleUserMenuEnter = () => {
    if (userMenuTimeoutRef.current) {
      clearTimeout(userMenuTimeoutRef.current);
    }
    setUserMenuOpen(true);
  };

  const handleUserMenuLeave = () => {
    userMenuTimeoutRef.current = setTimeout(() => {
      setUserMenuOpen(false);
    }, 150); // Delay de 150ms para mejor UX
  };

  // Manejo de navegación por teclado para accesibilidad
  const handleKeyDown = (event, menuType) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (menuType === 'user') {
        setUserMenuOpen(!userMenuOpen);
      } else if (menuType === 'dropdown') {
        setOpenDropdown(openDropdown === menuType ? null : menuType);
      }
    } else if (event.key === 'Escape') {
      setUserMenuOpen(false);
      setOpenDropdown(null);
    }
  };

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Utilidades
  const getMenuLink = (section) => {
    return location.pathname === '/menu' ? `#${section}` : `/menu#${section}`;
  };

  const getUserInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  // Componente de menú móvil para reducir duplicación
  const MobileUserSection = () => (
    <div className="mobile-actions">
      {isAuthenticated ? (
        <>
          <div className="mobile-user-info epic-mobile">
            <div className="mobile-avatar">
              {getUserInitial(user.name)}
            </div>
            <span>Hola, {user.name}</span>
          </div>
          <button 
            className="mobile-btn logout-mobile" 
            onClick={handleLogout}
            type="button"
          >
            Cerrar Sesión
          </button>
        </>
      ) : (
        <>
          <Link to="/login" className="mobile-btn auth-btn" onClick={handleLinkClick}>
            Iniciar Sesión
          </Link>
          <Link to="/register" className="mobile-btn auth-btn secondary" onClick={handleLinkClick}>
            Registrarse
          </Link>
          <Link to="/order" className="mobile-btn primary" onClick={handleLinkClick}>
            Pedir Ahora
          </Link>
        </>
      )}
    </div>
  );

  return (
    <header className={`header ${isAuthenticated ? 'header-authenticated' : ''}`}>
      {/* Contact Bar */}
      <div className="contact-bar">
        <div className="container">
          <div className="social-links">
            <span className="social-text">Síguenos:</span>
            <div className="social-icons">
              <a 
                href="#" 
                className="social-link"
                aria-label="Síguenos en Facebook"
              >
                <FaFacebookF />
              </a>
              <a 
                href="#" 
                className="social-link"
                aria-label="Síguenos en Twitter"
              >
                <FaTwitter />
              </a>
              <a 
                href="#" 
                className="social-link"
                aria-label="Síguenos en LinkedIn"
              >
                <FaLinkedinIn />
              </a>
              <a 
                href="#" 
                className="social-link"
                aria-label="Síguenos en Instagram"
              >
                <FaInstagram />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="main-nav" role="navigation" aria-label="Navegación principal">
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
              <ul className="nav-menu" role="menubar">
                <li className="nav-item" role="none">
                  <Link 
                    to="/" 
                    className={`nav-link ${isActiveLink('/') ? 'active' : ''}`} 
                    onClick={handleLinkClick}
                    role="menuitem"
                  >
                    Inicio
                  </Link>
                </li>
                
                <li 
                  className={`nav-item dropdown ${openDropdown === 'pages' ? 'active' : ''}`}
                  onMouseEnter={() => setOpenDropdown('pages')}
                  onMouseLeave={() => setOpenDropdown(null)}
                  role="none"
                >
                  <span 
                    className="nav-link"
                    role="menuitem"
                    aria-haspopup="true"
                    aria-expanded={openDropdown === 'pages'}
                    tabIndex="0"
                    onKeyDown={(e) => handleKeyDown(e, 'pages')}
                  >
                    Páginas
                  </span>
                  <ul className="dropdown-menu" role="menu" aria-label="Submenú de páginas">
                    <li role="none">
                      <Link to="/about" onClick={handleLinkClick} role="menuitem">
                        Nosotros
                      </Link>
                    </li>
                    <li role="none">
                      <Link to="/equipo" onClick={handleLinkClick} role="menuitem">
                        Equipo
                      </Link>
                    </li>
                    <li role="none">
                      <Link to="/servicios" onClick={handleLinkClick} role="menuitem">
                        Servicios
                      </Link>
                    </li>
                  </ul>
                </li>

                <li 
                  className={`nav-item dropdown ${openDropdown === 'menu' ? 'active' : ''}`}
                  onMouseEnter={() => setOpenDropdown('menu')}
                  onMouseLeave={() => setOpenDropdown(null)}
                  role="none"
                >
                  <Link 
                    to="/menu" 
                    className={`nav-link ${isActiveLink('/menu') ? 'active' : ''}`} 
                    onClick={handleLinkClick}
                    role="menuitem"
                    aria-haspopup="true"
                    aria-expanded={openDropdown === 'menu'}
                  >
                    Menú
                  </Link>
                  <ul className="dropdown-menu" role="menu" aria-label="Submenú del menú">
                    <li role="none">
                      <a href={getMenuLink('entradas')} onClick={handleLinkClick} role="menuitem">
                        Entradas
                      </a>
                    </li>
                    <li role="none">
                      <a href={getMenuLink('platosprincipales')} onClick={handleLinkClick} role="menuitem">
                        Platos Principales
                      </a>
                    </li>
                    <li role="none">
                      <a href={getMenuLink('postres')} onClick={handleLinkClick} role="menuitem">
                        Postres
                      </a>
                    </li>
                    <li role="none">
                      <a href={getMenuLink('bebidas')} onClick={handleLinkClick} role="menuitem">
                        Bebidas
                      </a>
                    </li>
                  </ul>
                </li>

                <li className="nav-item" role="none">
                  <Link 
                    to="/Ubications" 
                    className={`nav-link ${isActiveLink('/Ubications') ? 'active' : ''}`} 
                    onClick={handleLinkClick}
                    role="menuitem"
                  >
                    Ubicaciones
                  </Link>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="nav-actions">
              <Link 
                to="/cart" 
                className="cart-btn"
                aria-label="Ver carrito de compras"
              >
                <FaShoppingCart />
                <span className="cart-count">0</span>
              </Link>

              {/* Menú de usuario condicional */}
              {isAuthenticated ? (
                // Usuario autenticado - Diseño Epic Games
                <div 
                  ref={userMenuRef}
                  className={`user-authenticated epic-style ${userMenuOpen ? 'active' : ''} ${avatarVisible ? 'visible' : ''}`}
                  onMouseEnter={handleUserMenuEnter}
                  onMouseLeave={handleUserMenuLeave}
                >
                  <div 
                    className="user-avatar-epic"
                    role="button"
                    aria-haspopup="true"
                    aria-expanded={userMenuOpen}
                    aria-label={`Menú de usuario para ${user.name}`}
                    tabIndex="0"
                    onKeyDown={(e) => handleKeyDown(e, 'user')}
                  >
                    <div className="avatar-ring"></div>
                    <div className="avatar-content">
                      {getUserInitial(user.name)}
                    </div>
                    <div className="user-status-indicator"></div>
                  </div>
                  
                  <div 
                    className="user-epic-dropdown"
                    role="menu"
                    aria-label="Opciones de usuario"
                  >
                    <div className="dropdown-header">
                      <div className="user-info">
                        <span className="user-name">{user.name}</span>
                        <span className="user-email">{user.email}</span>
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <ul className="dropdown-items">
                      <li role="none">
                        <Link to="/mis-pedidos" onClick={handleLinkClick} role="menuitem">
                          Mis Pedidos
                        </Link>
                      </li>
                      <li role="none">
                        <Link to="/recompensas" onClick={handleLinkClick} role="menuitem">
                          Recompensas
                        </Link>
                      </li>
                      <li role="none">
                        <Link to="/monedero" onClick={handleLinkClick} role="menuitem">
                          Monedero
                        </Link>
                      </li>
                      <li role="none">
                        <Link to="/cupones" onClick={handleLinkClick} role="menuitem">
                          Cupones
                        </Link>
                      </li>
                      <li role="none">
                        <Link to="/MiPerfil" onClick={handleLinkClick} role="menuitem">
                          Mi Cuenta
                        </Link>
                      </li>
                      <li role="none">
                        <Link to="/canjear" onClick={handleLinkClick} role="menuitem">
                          Canjear Código
                        </Link>
                      </li>
                      <li role="none">
                        <Link to="/favoritos" onClick={handleLinkClick} role="menuitem">
                          Favoritos
                        </Link>
                      </li>
                    </ul>
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-footer">
                      <button 
                        className="logout-btn" 
                        onClick={handleLogout}
                        type="button"
                        role="menuitem"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // Usuario no autenticado - Botones estilizados
                <div className="auth-buttons">
                  <Link to="/login" className="auth-btn login-btn" onClick={handleLinkClick}>
                    Iniciar Sesión
                  </Link>
                  <Link to="/register" className="auth-btn register-btn" onClick={handleLinkClick}>
                    Registrarse
                  </Link>
                </div>
              )}

              <button 
                className="mobile-toggle"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? 'Cerrar menú móvil' : 'Abrir menú móvil'}
                aria-expanded={mobileOpen}
                type="button"
              >
                {mobileOpen ? <FaTimes /> : <FaBars />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div 
          className="mobile-overlay" 
          onClick={() => setMobileOpen(false)}
          role="presentation"
        >
          <div 
            className="mobile-menu" 
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Menú de navegación móvil"
          >
            <div className="mobile-header">
              <h3>Menú</h3>
              <button 
                onClick={() => setMobileOpen(false)}
                aria-label="Cerrar menú"
                type="button"
              >
                <FaTimes />
              </button>
            </div>
            <ul className="mobile-nav" role="menu">
              <li role="none">
                <Link to="/" onClick={handleLinkClick} role="menuitem">Inicio</Link>
              </li>
              <li role="none">
                <Link to="/about" onClick={handleLinkClick} role="menuitem">Nosotros</Link>
              </li>
              <li role="none">
                <Link to="/equipo" onClick={handleLinkClick} role="menuitem">Equipo</Link>
              </li>
              <li role="none">
                <Link to="/servicios" onClick={handleLinkClick} role="menuitem">Servicios</Link>
              </li>
              <li role="none">
                <Link to="/menu" onClick={handleLinkClick} role="menuitem">Menú</Link>
              </li>
              <li role="none">
                <Link to="/Ubications" onClick={handleLinkClick} role="menuitem">Ubicaciones</Link>
              </li>
              <li role="none">
                <Link to="/contact" onClick={handleLinkClick} role="menuitem">Contacto</Link>
              </li>
            </ul>
            <MobileUserSection />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;