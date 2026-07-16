import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DomingoHUD from './components/DomingoHUD';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DomingoHUD />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
