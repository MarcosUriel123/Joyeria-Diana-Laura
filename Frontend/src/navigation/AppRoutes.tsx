// Ruta:Joyeria-Diana-Laura/Frontend/src/navigation/AppRoutes.tsx

// Este archivo es para manejar las rutas de la aplicación
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; // para manejar las rutas
import LoginScreen from "../screens/LoginScreen";
import RegistroScreen from "../screens/RegistroScreen"; // pantalla de registro
import OlvideContraseniaScreen from "../screens/OlvideContraseniaScreen"; // pantalla de recuperación de contraseña
import ReiniciarContraseniaScreen from "../screens/ReiniciarContraseniaScreen"; // pantalla de reinicio de contraseña
import InicioScreen from "../screens/InicioScreen"; // pantalla de inicio
import ResetPasswordScreen from "../screens/ReiniciarContraseniaScreen";
import { useAuth } from "../contexts/AuthContext";

// Componente para proteger rutas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth(); // obtenemos el usuario y el estado de carga

    if (loading) {
        return (
        <div className="flex items-center justify-center h-screen text-lg font-semibold">
        Cargando...
        </div>
    );
    }

    if (!user) {
    return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

// Definimos las rutas principales
export default function AppRoutes() {
    return (
    <BrowserRouter>
        <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/registro" element={<RegistroScreen />} />
        <Route path="/olvide" element={<OlvideContraseniaScreen />} />
        <Route path="/reiniciar" element={<ReiniciarContraseniaScreen />} />
        <Route path="/reset-password" element={<ResetPasswordScreen />} />

        {/* Rutas protegidas */}
        <Route
            path="/inicio"
            element={
            <ProtectedRoute>
                <InicioScreen />
            </ProtectedRoute>
            }
        />

        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/inicio" replace />} />
        </Routes>
    </BrowserRouter>
    );
}
