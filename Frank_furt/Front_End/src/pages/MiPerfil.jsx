import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EditarPerfil from '../components/Editarperfil';
import { ArrowLeft, User, Shield, Bell, CreditCard } from 'lucide-react';
import '../styles/MiPerfil.css';

// Simulación de contexto de autenticación
const useAuth = () => {
  const [user, setUser] = useState({
    id: 1,
    nombre: 'Carlos Rivera',
    email: 'carlos@frankfurt.com',
    telefono: '+57 300 123 4567',
    direccion: 'Calle 85 #15-20, Bogotá, Colombia',
    fechaRegistro: '2023-08-15',
    avatar: null, // URL de la imagen o null
    preferencias: {
      notificaciones: true,
      ofertas: true,
      newsletter: false
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [loading, setLoading] = useState(false);

  // Función simulada para actualizar el perfil
  const updateUserProfile = async (updatedData) => {
    setLoading(true);
    
    // Simular llamada a API
    return new Promise((resolve) => {
      setTimeout(() => {
        setUser(prev => ({
          ...prev,
          ...updatedData
        }));
        setLoading(false);
        resolve({ success: true, message: 'Perfil actualizado correctamente' });
      }, 1500);
    });
  };

  return {
    user,
    isAuthenticated,
    loading,
    updateUserProfile
  };
};

const MiPerfil = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('perfil');

  // Verificar autenticación al cargar
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Mostrar loading mientras se verifica autenticación
  if (!isAuthenticated) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Verificando autenticación...</p>
      </div>
    );
  }

  const handleGoBack = () => {
    navigate(-1);
  };

  const tabs = [
    { id: 'perfil', label: 'Mi Perfil', icon: User },
    { id: 'seguridad', label: 'Seguridad', icon: Shield },
    { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
    { id: 'pagos', label: 'Métodos de Pago', icon: CreditCard }
  ];

  return (
    <div className="mi-perfil-container">
      {/* Header de la página */}
      <div className="profile-header">
        <div className="container">
          <div className="header-content">
            <button className="back-button" onClick={handleGoBack}>
              <ArrowLeft size={20} />
              <span>Volver</span>
            </button>
            
            <div className="header-title">
              <h1>Mi Cuenta</h1>
              <p>Gestiona tu información personal y preferencias</p>
            </div>
            
            <div className="user-welcome">
              <div className="user-avatar-header">
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" />
                ) : (
                  <span>{user.nombre.charAt(0)}</span>
                )}
              </div>
              <div className="welcome-text">
                <span className="greeting">¡Hola!</span>
                <span className="username">{user.nombre}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="profile-main">
        <div className="container">
          <div className="profile-layout">
            {/* Sidebar con tabs */}
            <aside className="profile-sidebar">
              <nav className="profile-nav">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <IconComponent size={20} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* Contenido del tab activo */}
            <main className="profile-content">
              {activeTab === 'perfil' && (
                <EditarPerfil
                  user={user}
                  updateUserProfile={updateUserProfile}
                  loading={loading}
                />
              )}
              
              {activeTab === 'seguridad' && (
                <div className="tab-content">
                  <div className="content-card">
                    <h2>Configuración de Seguridad</h2>
                    <p>Aquí podrás cambiar tu contraseña y configurar la autenticación de dos factores.</p>
                    <div className="feature-placeholder">
                      <Shield size={48} />
                      <p>Próximamente disponible</p>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'notificaciones' && (
                <div className="tab-content">
                  <div className="content-card">
                    <h2>Preferencias de Notificaciones</h2>
                    <p>Personaliza qué notificaciones deseas recibir.</p>
                    <div className="feature-placeholder">
                      <Bell size={48} />
                      <p>Próximamente disponible</p>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'pagos' && (
                <div className="tab-content">
                  <div className="content-card">
                    <h2>Métodos de Pago</h2>
                    <p>Gestiona tus tarjetas y métodos de pago guardados.</p>
                    <div className="feature-placeholder">
                      <CreditCard size={48} />
                      <p>Próximamente disponible</p>
                    </div>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiPerfil;