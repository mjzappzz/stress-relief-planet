import { useState, useEffect } from "react";
import useStore from "../store";

export function BreathingExercise() {
  const [phase, setPhase] = useState("inhale"); // inhale, hold, exhale
  const [rounds, setRounds] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(4);

  const PHASES = {
    inhale: { text: "吸气", duration: 4, desc: "通过鼻子缓慢吸气" },
    hold: { text: "屏息", duration: 7, desc: "屏住呼吸" },
    exhale: { text: "呼气", duration: 8, desc: "通过嘴巴缓慢呼气" }
  };

  const currentPhase = PHASES[phase];

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setPhase((prevPhase) => {
            if (prevPhase === "inhale") return "hold";
            if (prevPhase === "hold") return "exhale";
            return "inhale";
          });
          return currentPhase.duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, phase, currentPhase.duration]);

  useEffect(() => {
    if (phase === "inhale") {
      setTotalDuration((d) => d + 4);
    } else if (phase === "hold") {
      setTotalDuration((d) => d + 7);
    } else if (phase === "exhale") {
      setRounds((r) => r + 1);
    }
  }, [phase]);

  const startExercise = () => {
    setIsActive(true);
    setPhase("inhale");
    setTimeLeft(4);
  };

  const pauseExercise = () => {
    setIsActive(false);
  };

  const resetExercise = () => {
    setIsActive(false);
    setPhase("inhale");
    setTimeLeft(4);
    setRounds(0);
    setTotalDuration(0);
  };

  const handleSave = async () => {
    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activityType: "breathing",
          duration: totalDuration,
          score: rounds,
          description: `完成 ${rounds} 轮呼吸练习`
        })
      });
      alert("记录已保存！");
      resetExercise();
    } catch (error) {
      console.error("保存失败:", error);
      alert("保存失败，请稍后重试");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate circle scale based on phase
  const getCircleScale = () => {
    if (phase === "inhale") return 1 + (4 - timeLeft) * 0.15;
    if (phase === "hold") return 1.6;
    if (phase === "exhale") return 1 + (8 - timeLeft) * (-0.1);
    return 1;
  };

  return (
    <div className="container mx-auto px-4 py-16 animate-fade-in min-h-screen flex flex-col justify-center">
      <div className="max-w-2xl mx-auto text-center">
        {/* Header */}
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
          呼吸练习 <span className="text-cyan-500">Breathing</span>
        </h1>
        <p className="text-lg text-slate-600 mb-12">
          4-7-8 呼吸法：帮助你快速平静下来
        </p>

        {/* Main Visual */}
        <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto mb-12">
          {/* Breathing Circle */}
          <div
            className="absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-in-out"
            style={{ transform: `scale(${getCircleScale()})` }}
          >
            <div className="w-48 h-48 md:w-56 md:h-56 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full opacity-20 blur-2xl animate-pulse"></div>
          </div>
          <div
            className="absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-in-out z-10"
            style={{ transform: `scale(${getCircleScale()})` }}
          >
            <div className="w-36 h-36 md:w-44 md:h-44 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full shadow-2xl flex items-center justify-center text-white">
              <div className="text-center">
                <div className="text-6xl md:text-7xl font-bold mb-1">{timeLeft}</div>
                <div className="text-xl md:text-2xl font-medium opacity-90">{currentPhase.text}</div>
              </div>
            </div>
          </div>
          <div
            className="absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-in-out z-20"
            style={{ transform: `scale(${getCircleScale()})` }}
          >
            <div className="text-center">
              <p className="text-xl md:text-2xl text-slate-700 font-medium">{currentPhase.desc}</p>
              <p className="text-sm text-slate-500 mt-2">
                {phase === "inhale" && "吸气..."}
                {phase === "hold" && "屏住..."}
                {phase === "exhale" && "呼气..."}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-6 mb-10">
          <div className="card">
            <div className="text-4xl font-bold text-cyan-600 mb-1">{rounds}</div>
            <div className="text-sm text-slate-500">完成轮数</div>
          </div>
          <div className="card">
            <div className="text-4xl font-bold text-blue-600 mb-1">{formatTime(totalDuration)}</div>
            <div className="text-sm text-slate-500">总时长</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          {isActive ? (
            <button
              onClick={pauseExercise}
              className="btn-secondary px-8 py-3 text-lg"
            >
              暂停练习
            </button>
          ) : (
            <button
              onClick={startExercise}
              className="btn-primary px-8 py-3 text-lg"
            >
              开始练习
            </button>
          )}
          
          <button
            onClick={resetExercise}
            className="btn-secondary px-6 py-3 text-lg"
            disabled={isActive}
          >
            重置
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg mx-auto">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center justify-center gap-2">
            <span className="text-2xl">📖</span> 练习说明
          </h2>
          <div className="space-y-4 text-left">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600 font-bold flex-shrink-0">1</div>
              <div>
                <h3 className="font-semibold text-slate-800">吸气 4秒</h3>
                <p className="text-sm text-slate-600 mt-1">通过鼻子缓慢吸气，感受腹部鼓起</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold flex-shrink-0">2</div>
              <div>
                <h3 className="font-semibold text-slate-800">屏息 7秒</h3>
                <p className="text-sm text-slate-600 mt-1">屏住呼吸，保持安静</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold flex-shrink-0">3</div>
              <div>
                <h3 className="font-semibold text-slate-800">呼气 8秒</h3>
                <p className="text-sm text-slate-600 mt-1">通过嘴巴缓慢呼气，感受身体放松</p>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-200 text-center">
            <p className="text-slate-600 text-sm">
              建议每天练习 3-4 轮，每次 5-10 分钟
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
