import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';
import DashboardRouter from './components/DashboardRouter';
import SOSDashboard from './components/SOSDashboard';
import DisasterManagement from './components/DisasterManagement';
import DisasterHeatMap from './components/DisasterHeatMap';
import SOSHeatMap from './components/SOSHeatMapNew';
import ResourceManagement from './components/ResourceManagement';
import Settings from './components/Settings';
import NDXPage from './components/NDXPage';
import AnalyticsPage from './components/AnalyticsPage';
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
                    <DashboardRouter />
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
                path="/map" 
                element={<Navigate to="/map/disaster" replace />} 
              />
              <Route 
                path="/map/disaster" 
                element={
                  <ProtectedRoute>
                    <DisasterHeatMap />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/map/sos" 
                element={
                  <ProtectedRoute>
                    <SOSHeatMap />
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
                path="/analytics" 
                element={
                  <ProtectedRoute>
                    <AnalyticsPage />
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
