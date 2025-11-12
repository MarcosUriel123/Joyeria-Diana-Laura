// Ruta:Joyeria-Diana-Laura/Frontend/src/screens/InicioScreen.tsx

import React from "react";
import { useAuth } from "../contexts/AuthContext";
import "../styles/InicioScreen.css";

export default function InicioScreen() {
    const { user, logout } = useAuth();
    
    return (
        <div className="inicio-container">
            <div className="inicio-card">
                <h1 className="inicio-title">
                    💎 Bienvenido a Joyería Diana Laura
                </h1>
                
                <p className="user-email">
                    Hola, <strong>{user?.nombre}</strong> ({user?.email})
                </p>
                
                <button 
                    className="logout-button"
                    onClick={logout}
                >
                    Cerrar Sesión
                </button>
                
                <div className="inicio-info">
                    <h3>🎯 Sistema de Gestión</h3>
                    <p>
                        Bienvenido al sistema de gestión de inventario y ventas 
                        de Joyería Diana Laura. Aquí podrás administrar productos, 
                        clientes y ventas de forma eficiente.
                    </p>
                </div>
            </div>
        </div>
    );
}