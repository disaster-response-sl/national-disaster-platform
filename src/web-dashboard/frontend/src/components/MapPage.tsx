import React from 'react';
import { Navigate } from 'react-router-dom';

const MapPage: React.FC = () => {
  return <Navigate to="/map/disaster" replace />;
};

export default MapPage;
