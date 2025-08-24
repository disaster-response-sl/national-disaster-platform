import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import MapsPage from './components/MapsPage';

function App() {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'maps'>('dashboard');

  const handleNavigateToMaps = () => {
    setCurrentPage('maps');
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
  };

  return (
    <div className="App">
      {currentPage === 'dashboard' ? (
        <Dashboard onNavigateToMaps={handleNavigateToMaps} />
      ) : (
        <MapsPage onBack={handleBackToDashboard} />
      )}
    </div>
  );
}

export default App;
