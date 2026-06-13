import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export function MazeGame() {
  const [gridSize, setGridSize] = useState(10);
  const [maze, setMaze] = useState([]);
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [isWin, setIsWin] = useState(false);
  const [time, setTime] = useState(0);
  const [level, setLevel] = useState(1);

  const generateMaze = useCallback((size) => {
    const maze = Array(size).fill().map(() => Array(size).fill(1));
    const directions = [
      [0, -2], [0, 2], [-2, 0], [2, 0]
    ];

    const shuffle = (array) => array.sort(() => Math.random() - 0.5);

    const carve = (x, y) => {
      maze[y][x] = 0;
      const shuffledDirs = shuffle([...directions]);

      for (const [dx, dy] of shuffledDirs) {
        const nx = x + dx;
        const ny = y + dy;

        if (nx > 0 && nx < size - 1 && ny > 0 && ny < size - 1 && maze[ny][nx] === 1) {
          maze[y + dy / 2][x + dx / 2] = 0;
          carve(nx, ny);
        }
      }
    };

    carve(1, 1);
    maze[size - 2][size - 2] = 0;
    return maze;
  }, []);

  const startNewGame = useCallback(() => {
    const newMaze = generateMaze(gridSize);
    setMaze(newMaze);
    setPlayerPos({ x: 1, y: 1 });
    setIsWin(false);
    setTime(0);
  }, [gridSize, generateMaze]);

  useEffect(() => {
    startNewGame();
  }, [gridSize, startNewGame]);

  useEffect(() => {
    if (isWin) {
      axios.post("/api/progress", {
        activityType: "maze",
        duration: time,
        score: level,
        description: `完成第 ${level} 关迷宫`
      });
    }
  }, [isWin, time]);

  useEffect(() => {
    if (isWin) return;
    const interval = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isWin]);

  const handleKeyDown = useCallback((e) => {
    if (isWin) return;

    const { x, y } = playerPos;
    let newX = x;
    let newY = y;

    switch (e.key) {
      case "ArrowUp":
      case "w":
      case "W":
        newY -= 1;
        break;
      case "ArrowDown":
      case "s":
      case "S":
        newY += 1;
        break;
      case "ArrowLeft":
      case "a":
      case "A":
        newX -= 1;
        break;
      case "ArrowRight":
      case "d":
      case "D":
        newX += 1;
        break;
      default:
        return;
    }

    e.preventDefault();

    if (
      newX >= 0 &&
      newX < gridSize &&
      newY >= 0 &&
      newY < gridSize &&
      maze[newY][newX] === 0
    ) {
      setPlayerPos({ x: newX, y: newY });

      // Check if reached exit (center of the cell)
      const cellCenter = 0.5;
      const exitCenter = gridSize - 2 + 0.5;
      
      if (Math.abs(newX - (gridSize - 2)) < 0.5 && Math.abs(newY - (gridSize - 2)) < 0.5) {
        setIsWin(true);
      }
    }
  }, [playerPos, maze, gridSize, isWin]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleNextLevel = () => {
    setLevel(prev => prev + 1);
    const newGridSize = gridSize === 10 ? 15 : 10;
    setGridSize(newGridSize);
    startNewGame();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">迷宫挑战</h1>

        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
              时间: <span className="text-blue-700 font-bold">{formatTime(time)}</span>
            </div>
            <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
              关卡: <span className="text-orange-800 font-bold">{level}</span>
            </div>
            <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
              难度: <span className="text-orange-800 font-bold">{gridSize}x{gridSize}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-xl mx-auto max-w-lg">
          <div className="grid" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
            {maze.map((row, y) =>
              row.map((cell, x) => {
                const isPlayer = playerPos.x === x && playerPos.y === y;
                const isExit = x === gridSize - 2 && y === gridSize - 2;

                return (
                  <div
                    key={`${x}-${y}`}
                    className={`w-6 h-6 flex items-center justify-center relative ${
                      cell === 1 ? "bg-gray-600" : "bg-transparent"
                    } ${isPlayer ? "bg-blue-500" : ""} ${isExit ? "bg-green-500" : ""} rounded-sm overflow-hidden`}
                  >
                    {isPlayer && (
                      <div className="w-5 h-5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-lg flex items-center justify-center relative">
                        {/* Head */}
                        <div className="w-3 h-3 bg-white rounded-full absolute top-0.5"></div>
                        {/* Eyes */}
                        <div className="w-0.5 h-0.5 bg-blue-900 rounded-full absolute top-1 left-0.5"></div>
                        <div className="w-0.5 h-0.5 bg-blue-900 rounded-full absolute top-1 right-0.5"></div>
                        {/* Body */}
                        <div className="w-2 h-2 bg-blue-300 rounded-full absolute bottom-0.5"></div>
                      </div>
                    )}
                    {isExit && (
                      <svg className="w-5 h-5 text-green-100 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {isWin && (
          <div className="mt-6 p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
            <h2 className="text-3xl font-bold text-emerald-800 mb-3">关卡完成</h2>
            <p className="text-emerald-700 text-lg mb-4">用时: {formatTime(time)}</p>
            <button
              onClick={handleNextLevel}
              className="btn-primary px-8 py-3 text-lg"
            >
              下一关
            </button>
          </div>
        )}

        <div className="mt-6 text-center text-slate-500 text-sm">
          <p>使用方向键或 WASD 移动小人</p>
          <p>从左上角走到右下角绿色对钩处即可通关</p>
        </div>
      </div>
    </div>
  );
}
