import React, { useState, useRef } from 'react';
import { Camera, Save, Check, X, Eye, EyeOff } from 'lucide-react';

const EditarPerfil = ({ user, updateUserProfile, loading }) => {
  const [formData, setFormData] = useState({
    nombre: user.nombre || '',
    email: user.email || '',
    telefono: user.telefono || '',
    direccion: user.direccion || '',
    avatar: user.avatar || null
  });

  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user.avatar);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef(null);

  // Validaciones
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'nombre':
        if (!value.trim()) {
          newErrors.nombre = 'El nombre es obligatorio';
        } else if (value.length < 2) {
          newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
        } else {
          delete newErrors.nombre;
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          newErrors.email = 'El correo electrónico es obligatorio';
        } else if (!emailRegex.test(value)) {
          newErrors.email = 'Ingresa un correo electrónico válido';
        } else {
          delete newErrors.email;
        }
        break;

      case 'telefono':
        const phoneRegex = /^[+]?[\d\s-()]{10,}$/;
        if (!value.trim()) {
          newErrors.telefono = 'El teléfono es obligatorio';
        } else if (!phoneRegex.test(value.replace(/\s/g, ''))) {
          newErrors.telefono = 'Ingresa un número de teléfono válido';
        } else {
          delete newErrors.telefono;
        }
        break;

      case 'direccion':
        if (!value.trim()) {
          newErrors.direccion = 'La dirección es obligatoria';
        } else if (value.length < 10) {
          newErrors.direccion = 'La dirección debe ser más específica';
        } else {
          delete newErrors.direccion;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validar en tiempo real
    validateField(name, value);
  };

  // Manejar cambio de foto
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona una imagen válida');
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar los 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        setAvatarPreview(imageUrl);
        setFormData(prev => ({
          ...prev,
          avatar: imageUrl
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Validar formulario completo
  const validateForm = () => {
    const fields = ['nombre', 'email', 'telefono', 'direccion'];
    let isValid = true;

    fields.forEach(field => {
      const fieldIsValid = validateField(field, formData[field]);
      if (!fieldIsValid) isValid = false;
    });

    return isValid;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsEditing(true);
    
    try {
      const result = await updateUserProfile(formData);
      
      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      alert('Hubo un error al guardar los cambios. Inténtalo de nuevo.');
    } finally {
      setIsEditing(false);
    }
  };

  // Obtener iniciales para avatar por defecto
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="editar-perfil">
      {/* Mensaje de éxito */}
      {showSuccess && (
        <div className="success-toast">
          <div className="success-content">
            <Check size={20} />
            <span>¡Perfil actualizado correctamente!</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-form">
        {/* Sección de foto de perfil */}
        <div className="avatar-section">
          <h2>Foto de Perfil</h2>
          
          <div className="avatar-container">
            <div className="avatar-wrapper">
              <div className="avatar-image">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" />
                ) : (
                  <div className="avatar-placeholder">
                    {getInitials(formData.nombre)}
                  </div>
                )}
                <div className="avatar-overlay">
                  <Camera size={24} />
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="avatar-input"
              />
              
              <button
                type="button"
                className="change-avatar-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={isEditing}
              >
                <Camera size={18} />
                Cambiar Foto
              </button>
            </div>
          </div>
        </div>

        {/* Información personal */}
        <div className="form-section">
          <h2>Información Personal</h2>
          
          <div className="form-grid">
            {/* Nombre completo */}
            <div className="form-group">
              <label htmlFor="nombre">Nombre Completo *</label>
              <div className={`input-wrapper ${errors.nombre ? 'error' : ''}`}>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  disabled={isEditing}
                  placeholder="Ingresa tu nombre completo"
                />
              </div>
              {errors.nombre && (
                <span className="error-message">{errors.nombre}</span>
              )}
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">Correo Electrónico *</label>
              <div className={`input-wrapper ${errors.email ? 'error' : ''}`}>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isEditing}
                  placeholder="tu@correo.com"
                />
              </div>
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>

            {/* Teléfono */}
            <div className="form-group">
              <label htmlFor="telefono">Teléfono *</label>
              <div className={`input-wrapper ${errors.telefono ? 'error' : ''}`}>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  disabled={isEditing}
                  placeholder="+57 300 123 4567"
                />
              </div>
              {errors.telefono && (
                <span className="error-message">{errors.telefono}</span>
              )}
            </div>

            {/* Dirección */}
            <div className="form-group full-width">
              <label htmlFor="direccion">Dirección *</label>
              <div className={`input-wrapper ${errors.direccion ? 'error' : ''}`}>
                <input
                  type="text"
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  disabled={isEditing}
                  placeholder="Calle 85 #15-20, Bogotá, Colombia"
                />
              </div>
              {errors.direccion && (
                <span className="error-message">{errors.direccion}</span>
              )}
            </div>
          </div>
        </div>

        {/* Botón de guardar */}
        <div className="form-actions">
          <button
            type="submit"
            className="save-button"
            disabled={isEditing || Object.keys(errors).length > 0}
          >
            {isEditing ? (
              <>
                <div className="button-spinner"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save size={18} />
                Guardar Cambios
              </>
            )}
          </button>
          
          <p className="required-note">
            * Campos obligatorios
          </p>
        </div>
      </form>
    </div>
  );
};

export default EditarPerfil;