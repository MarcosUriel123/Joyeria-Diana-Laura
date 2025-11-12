// Ruta:Joyeria-Diana-Laura/Frontend/src/App.tsx

import React from 'react';
import './App.css';
import AppRoutes from './navigation/AppRoutes';
import { AuthProvider } from './contexts/AuthContext';

function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <AppRoutes/>
    </AuthProvider>
  );
}

export default App;