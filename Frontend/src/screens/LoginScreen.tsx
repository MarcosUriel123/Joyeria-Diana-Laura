// Ruta:Joyeria-Diana-Laura/Frontend/src/screens/LoginScreen.tsx

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../styles/LoginScreen.css";

const schema = z.object({
    email: z.string().email("Correo electrónico inválido"),
    password: z.string().min(1, "La contraseña es requerida"),
});

type FormData = z.infer<typeof schema>;

export default function LoginScreen() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { register, handleSubmit, formState: { errors }, setError } = useForm<FormData>({ 
        resolver: zodResolver(schema)
    });

    const onSubmit = async (data: FormData) => {
        try {
            await login(data.email, data.password);
            navigate("/inicio");
        } catch (error: any) {
            setError('root', { 
                type: 'manual', 
                message: error.message 
            });
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h2>Iniciar sesión</h2>
                    <p>Ingresa a tu cuenta de Joyería Diana Laura</p>
                </div>
                
                {errors.root && (
                    <div className="error-message">
                        {errors.root.message}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="login-form">
                    <div className="login-form-group">
                        <label htmlFor="email">Correo electrónico</label>
                        <input 
                            id="email"
                            type="email" 
                            placeholder="tu@email.com" 
                            className={`login-input ${errors.email ? 'error' : ''}`}
                            {...register("email")} 
                        />
                        {errors.email && (
                            <span className="login-error">{errors.email.message}</span>
                        )}
                    </div>

                    <div className="login-form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input 
                            id="password"
                            type="password" 
                            placeholder="Tu contraseña"
                            className={`login-input ${errors.password ? 'error' : ''}`}
                            {...register("password")} 
                        />
                        {errors.password && (
                            <span className="login-error">{errors.password.message}</span>
                        )}
                    </div>

                    <button type="submit" className="login-button">
                        Entrar
                    </button>
                </form>

                <div className="login-links">
                    <Link to="/registro" className="login-link">
                        Crear cuenta
                    </Link>
                    <Link to="/olvide" className="login-link">
                        ¿Olvidaste tu contraseña?
                    </Link>
                </div>
            </div>
        </div>
    );
}