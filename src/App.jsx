import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import TeamDashboard from "./Components/TeamDashboard";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/teams/:teamNumber" element={<TeamDashboard />} />
    </Routes>
  );
}