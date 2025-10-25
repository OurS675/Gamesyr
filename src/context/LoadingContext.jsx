import React, { createContext, useState, useContext } from 'react';
import GlobalLoader from '../components/GlobalLoader';

// Crear el contexto
const LoadingContext = createContext();

// Hook personalizado para usar el contexto
export const useLoading = () => useContext(LoadingContext);

// Proveedor del contexto
export const LoadingProvider = ({ children, initialLoading = false }) => {
  const [isLoading, setIsLoading] = useState(initialLoading);

  // Función para mostrar el loader
  const showLoader = () => setIsLoading(true);
  
  // Función para ocultar el loader
  const hideLoader = () => setIsLoading(false);

  return (
    <LoadingContext.Provider value={{ isLoading, showLoader, hideLoader }}>
      {isLoading && <GlobalLoader />}
      {children}
    </LoadingContext.Provider>
  );
};