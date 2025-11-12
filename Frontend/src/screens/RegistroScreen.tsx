// Ruta:Joyeria-Diana-Laura/Frontend/src/screens/RegistroScreen.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../styles/RegistroScreen.css";

const schema = z.object({
    email: z.string().email("Correo electrónico inválido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
});

type FormData = z.infer<typeof schema>;

export default function RegistroScreen() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const { register: formRegister, handleSubmit, formState: { errors }, setError } = useForm<FormData>({ 
        resolver: zodResolver(schema) 
    });

    const onSubmit = async (data: FormData) => {
        try {
            await register(data.email, data.password, data.nombre);
            alert("Usuario registrado correctamente. Ahora puedes iniciar sesión.");
            navigate("/login");
        } catch (error: any) {
            setError('root', { 
                type: 'manual', 
                message: error.message 
            });
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <div className="register-header">
                    <h2>Crear Cuenta</h2>
                    <p>Regístrate en Joyería Diana Laura</p>
                </div>
                
                {errors.root && (
                    <div className="error-message">
                        {errors.root.message}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="register-form">
                    <div className="register-form-group">
                        <label htmlFor="nombre">Nombre completo</label>
                        <input 
                            id="nombre"
                            type="text"
                            placeholder="Tu nombre completo"
                            className={`register-input ${errors.nombre ? 'error' : ''}`}
                            {...formRegister("nombre")} 
                        />
                        {errors.nombre && (
                            <span className="register-error">{errors.nombre.message}</span>
                        )}
                    </div>

                    <div className="register-form-group">
                        <label htmlFor="email">Correo electrónico</label>
                        <input 
                            id="email"
                            type="email"
                            placeholder="tu@email.com"
                            className={`register-input ${errors.email ? 'error' : ''}`}
                            {...formRegister("email")} 
                        />
                        {errors.email && (
                            <span className="register-error">{errors.email.message}</span>
                        )}
                    </div>

                    <div className="register-form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input 
                            id="password"
                            type="password"
                            placeholder="Mínimo 6 caracteres"
                            className={`register-input ${errors.password ? 'error' : ''}`}
                            {...formRegister("password")} 
                        />
                        {errors.password && (
                            <span className="register-error">{errors.password.message}</span>
                        )}
                        <div className="password-requirements">
                            La contraseña debe tener al menos 6 caracteres
                        </div>
                    </div>

                    <button type="submit" className="register-button">
                        Crear Cuenta
                    </button>
                </form>

                <div className="register-links">
                    <Link to="/login" className="register-link">
                        ¿Ya tienes cuenta? Inicia sesión aquí
                    </Link>
                </div>
            </div>
        </div>
    );
}