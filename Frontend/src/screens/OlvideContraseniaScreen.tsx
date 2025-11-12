// Ruta: Joyeria-Diana-Laura/Frontend/src/screens/OlvideContraseniaScreen.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/OlvideContraseniaScreen.css';

const OlvideContraseniaScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success) {
        setMessage('✅ Si el email existe, se ha enviado un enlace de recuperación. Revisa tu bandeja de entrada y spam.');
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="olvide-contrasenia-container">
      <div className="olvide-contrasenia-form">
        <h2>Recuperar Contraseña</h2>
        <p>Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
          </button>
        </form>
        
        {message && (
          <div className="success-message">
            <p>{message}</p>
            <div className="email-tips">
              <h4>💡 Consejos:</h4>
              <ul>
                <li>Revisa tu bandeja de entrada</li>
                <li>Revisa la carpeta de spam o correo no deseado</li>
                <li>El enlace expira en 1 hora</li>
              </ul>
            </div>
          </div>
        )}
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="back-to-login">
          <button onClick={() => navigate('/login')} className="back-button">
            ← Volver al Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default OlvideContraseniaScreen;