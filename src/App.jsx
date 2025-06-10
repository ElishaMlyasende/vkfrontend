import React from 'react';
import { Routes, Route,BrowserRouter } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import { Navigate } from 'react-router-dom';


export default function App() {
  const token=localStorage.getItem("token");
  return (
       
         <Routes>
          <Route path='/LoginPage'
                element={token? <Navigate to='/DashboardPage'/>:<LoginPage/>}
                  />
          <Route  path='/DashboardPage/*'
                  element={token? <DashboardPage/>:<Navigate to='/LoginPage'/>}
                  />
          <Route path='*'
             element={token?<Navigate to='/DashboardPage'/>:<LoginPage/>}
             />
         </Routes>
      
  );
}
