import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import SOSDashboard from './components/SOSDashboard';
import DisasterManagement from './components/DisasterManagement';
import MapsPage from './components/MapsPage';
import MapPage from './components/MapPage';
import ResourceManagement from './components/ResourceManagement';
import Settings from './components/Settings';
import NDXPage from './components/NDXPage';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/sos" 
                element={
                  <ProtectedRoute>
                    <SOSDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/disasters" 
                element={
                  <ProtectedRoute>
                    <DisasterManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/maps" 
                element={
                  <ProtectedRoute>
                    <MapsPage onBack={() => window.history.back()} />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/map" 
                element={
                  <ProtectedRoute>
                    <MapPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/resources" 
                element={
                  <ProtectedRoute>
                    <ResourceManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/ndx" 
                element={
                  <ProtectedRoute>
                    <NDXPage />
                  </ProtectedRoute>
                } 
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
