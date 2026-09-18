import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

import { Home } from "./pages/Home";
import { BubbleWrap } from "./pages/BubbleWrap";
import { MazeGame } from "./pages/MazeGame";
import { ColoringPage } from "./pages/ColoringPage";
import { BreathingExercise } from "./pages/BreathingExercise";
import { Piano } from "./pages/Piano";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Profile } from "./pages/Profile";
import { Stats } from "./pages/Stats";
import { Whisper } from "./pages/Whisper";

import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(() => (
    typeof window !== "undefined" ? window.scrollY > 20 : false
  ));

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        scrolled={scrolled}
      />

      <main className="flex-grow pt-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/bubble" element={<BubbleWrap />} />
          <Route path="/maze" element={<MazeGame />} />
          <Route path="/coloring" element={<ColoringPage />} />
          <Route path="/breathing" element={<BreathingExercise />} />
          <Route path="/piano" element={<Piano />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/whisper" element={<Whisper />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
