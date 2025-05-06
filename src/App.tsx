import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import AppRouter from './navigation/AppRouter';
import Splashscreen from './components/Splashscreen';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <AuthProvider>
      {showSplash ? (
        <Splashscreen onFinish={() => setShowSplash(false)} />
      ) : (
        <AppRouter />
      )}
    </AuthProvider>
  );
}

export default App;