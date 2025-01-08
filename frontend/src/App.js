import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './HomePage';
import LandingPage from './LandingPage';
import RegistrationPage from './RegisterPage';
import LoginPage from './LoginPage';
import ProfilePage from './ProfilePage'; // Importamos ProfilePage
import TablesPage from './TablesPage'; // Importamos TablesPage
import TableDetailsPage from './TableDetailsPage'; // Importamos TableDetailsPage
import PrivateRoute from './components/PrivateRoute';  // Importar PrivateRoute

function App() {

  const username = localStorage.getItem('username');

  return ( 
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Ruta protegida con PrivateRoute */}
        <Route element={<PrivateRoute />}>
          <Route path="/home" element={<HomePage username={username} />} />
        </Route>
        
        {/* Ruta protegida con PrivateRoute para ProfilePage */}
        <Route element={<PrivateRoute />}>
          <Route path="/profile" element={<ProfilePage username={username} />} />
        </Route>
        
        {/* Ruta protegida con PrivateRoute para TablesPage */}
        <Route element={<PrivateRoute />}>
          <Route path="/tables" element={<TablesPage username={username} />} />
        </Route>

        {/* Nueva ruta protegida para los detalles de una mesa */}
        <Route element={<PrivateRoute />}>
          <Route path="/table/:tableId" element={<TableDetailsPage />} /> 
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
