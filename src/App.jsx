import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import TeamDashboardNew from "./Components/TeamDashboardNew";
import About from "./Components/About";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/teams/:teamNumber" element={<TeamDashboardNew />} />
      <Route path="/about" element={<About />} />
    </Routes>
  );
}