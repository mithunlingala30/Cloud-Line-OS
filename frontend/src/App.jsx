import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import CloudBackground from "./components/CloudBackground";
import Landing from "./pages/Landing";
import ProblemList from "./pages/ProblemList";
import ProblemDetail from "./pages/ProblemDetail";
import Login from "./pages/Login";
import Playground from "./pages/Playground";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import "./styles/theme.css";
import "./styles/components.css";

export default function App() {
  return (
    <BrowserRouter>
      <CloudBackground />
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/problems" element={<ProblemList />} />
        <Route path="/problems/:id" element={<ProblemDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/playground" element={<Playground />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}
