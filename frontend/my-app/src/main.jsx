import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import MandAILogin from "./pages/login.jsx";
import MandAIRegister from "./pages/register.jsx";
import MandAI from "./pages/MandAI.jsx";
import ForecastPage from "./pages/ForecastPage.jsx";
import StatsPage from "./pages/StatsPage.jsx";
import MandiComparison from "./pages/Comparison.jsx";
import WeatherPage from "./pages/Weather.jsx";
import ProfilePage from "./pages/Profile.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<MandAILogin />} />
        <Route path="/register" element={<MandAIRegister />} />
        <Route path="/dashboard" element={<MandAI />} />
        <Route path="/comparison" element={<MandiComparison />} />
        <Route path="/forecast" element={<ForecastPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/weather" element={<WeatherPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("app")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
