import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Crown, Mail, Lock, AlertCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Login.css';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    correo: '',
    password: ''
  });

  // Verificar si ya está logueado
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Verificar si el token es válido
      verifyToken(token);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      // Configurado para puerto 3006
      const response = await fetch('http://localhost:3006/api/cliente/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Token válido, redirigir al dashboard o página principal
        navigate('/p');
      } else {
        // Token inválido, eliminar del localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    } catch (error) {
      console.error('Error verificando token:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar errores cuando el usuario comience a escribir
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    if (!formData.correo.trim()) {
      setError('El correo es requerido');
      return false;
    }
    
    if (!formData.password.trim()) {
      setError('La contraseña es requerida');
      return false;
    }

    // Validar formato de correo
    const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!correoRegex.test(formData.correo)) {
      setError('Por favor ingresa un correo válido');
      return false;
    }

    // Validar longitud mínima de contraseña
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
 e.preventDefault();
 
 if (!validateForm()) return;

 setLoading(true);
 setError('');
 setSuccess('');

 try {
 const response = await fetch('http://localhost:3006/api/users/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    correo: formData.correo.trim().toLowerCase(), 
    password: formData.password
  })
  });

  console.log(formData.correo.trim().toLowerCase(), formData.password);

  const data = await response.json();

  if (response.ok) { // Login exitoso
   setSuccess('¡Login exitoso! Redirigiendo...');
   localStorage.setItem('userData', JSON.stringify(data.user));
   setTimeout(() => {
    navigate('/p');
   }, 1500);
  } else {
   setError(data.message || 'Error al iniciar sesión');
  }

 } catch (error) {
  console.error('Error en login:', error);
  setError('Error de conexión. Verifica que el servidor esté funcionando.');
 } finally {
  setLoading(false);
 }
};
  const handleSwitchToRegister = () => {
    navigate('/Register'); // Ruta hacia la página de registro
  };

  const handleSwitchToRestablecer = () => {
    navigate('/Restablecer'); // Ruta hacia la página de restablecer contraseña
  };

  // Función para limpiar mensajes después de un tiempo
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000); // Limpiar después de 5 segundos

      return () => clearTimeout(timer);
    }
  }, [error, success]);

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Elementos decorativos */}
        <div className="decorative-circle circle-1"></div>
        <div className="decorative-circle circle-2"></div>
        
        {/* Header */}
        <div className="login-header">
          <div className="login-icon">
            <Crown className="icon" />
          </div>
          <h1 className="login-title">FRANK FURT</h1>
          <p className="login-subtitle">Bienvenido de vuelta</p>
        </div>

        {/* Mensajes de error y éxito */}
        {error && (
          <div className="message-container error-message">
            <AlertCircle className="message-icon" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="message-container success-message">
            <div className="success-icon">✓</div>
            <span>{success}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <div className="input-group-login">
            <div className="input-icon-login">
              <Mail className="icon-small" />
            </div>
            <input
              type="correo"
              name="correo"
              placeholder="Correo electrónico"
              value={formData.correo}
              onChange={handleInputChange}
              className="login-input"
              required
              disabled={loading}
              autoComplete="correo"
              aria-label="Correo electrónico"
            />
          </div>

          <div className="input-group-login">
            <div className="input-icon-login">
              <Lock className="icon-small" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Contraseña"
              value={formData.password}
              onChange={handleInputChange}
              className="login-input password-input"
              required
              disabled={loading}
              autoComplete="current-password"
              aria-label="Contraseña"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle"
              disabled={loading}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOff className="icon-small" /> : <Eye className="icon-small" />}
            </button>
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                className="custom-checkbox" 
                disabled={loading}
                aria-label="Recordar sesión"
              />
              <span className="checkbox-text">Recordarme</span>
            </label>
            
            <div className="login-switch">
               <li><Link to="/Restablecer" onClick={handleSwitchToRestablecer}>olvidatse tu contraseña?</Link></li>

            </div>
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loading || !formData.correo.trim() || !formData.password.trim()}
          >
            {loading ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <span>Iniciando sesión...</span>
              </div>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        {/* Divisor */}
        <div className="login-divider">
          <div className="divider-line"></div>
          <span className="divider-text">o</span>
          <div className="divider-line"></div>
        </div>

        {/* Cambiar a registro */}
        <div className="login-switch">
          <p className="switch-text">
            ¿No tienes cuenta?{' '}
             <li><Link to="/Register" onClick={handleSwitchToRegister}>Registrarse</Link></li>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;