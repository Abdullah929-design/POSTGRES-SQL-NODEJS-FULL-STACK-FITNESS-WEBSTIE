import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import Home from './pages/Home';
import Bmi from './pages/Bmi';
import ExerciseBrowser from './pages/ExerciseBrowser';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MealTracker from './pages/MealPlanner';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

// Gate the whole app while a stored token is validated on first load.
const AppContent = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress sx={{ color: '#FF2625' }} />
      </Box>
    );
  }

  return (
    <Box width="400px" sx={{ width: { xl: '1488px' } }} m='auto'>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Bmi" element={<Bmi />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Register" element={<Register />} />
        <Route
          path="/MealPlanner"
          element={
            <PrivateRoute>
              <MealTracker />
            </PrivateRoute>
          }
        />
        <Route
          path="/exercises"
          element={
            <PrivateRoute>
              <ExerciseBrowser />
            </PrivateRoute>
          }
        />
      </Routes>
      <Footer />
    </Box>
  );
};

const App = () => {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
