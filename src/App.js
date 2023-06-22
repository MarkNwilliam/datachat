import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DataChatPage from './pages/DataChatPage';
import React from 'react';

function App() {
  return (
    <div className="App">
     <div>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/datachat" element={<DataChatPage />} />
   
      </Routes>
    </div>
    </div>
  );
}

export default App;
