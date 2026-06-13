import { useState, useRef, useEffect } from "react";
import useStore from "../store";

export function ColoringPage() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#8b5cf6");
  const [brushSize, setBrushSize] = useState(5);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isEraser, setIsEraser] = useState(false);

  const colors = [
    "#8b5cf6", // violet
    "#06b6d4", // cyan
    "#f472b6", // pink
    "#f59e0b", // amber
    "#10b981", // emerald
    "#3b82f6", // blue
    "#ef4444", // red
    "#64748b", // slate
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    // Set canvas size
    const container = canvas.parentElement;
    canvas.width = container.offsetWidth - 32;
    canvas.height = 500;
    
    // Fill with white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Save initial state
    saveState();

    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.offsetWidth - 32;
        saveState();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const newDataUrl = canvas.toDataURL();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newDataUrl);
    
    // Limit history to 20 states
    if (newHistory.length > 20) {
      newHistory.shift();
    }
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const prevDataUrl = history[historyIndex - 1];
      
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        setHistoryIndex(historyIndex - 1);
      };
      img.src = prevDataUrl;
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
  };

  const saveImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = `drawing-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getMousePos(e);
    
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = isEraser ? "#ffffff" : color;
    ctx.lineWidth = brushSize;
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getMousePos(e);
    
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveState();
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 animate-fade-in min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            自由绘画 <span className="text-pink-500">Coloring</span>
          </h1>
          <p className="text-lg text-slate-600">
            挥洒创意，用颜色治愈心灵
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Toolbar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Colors */}
            <div className="card">
              <h3 className="font-bold text-slate-800 mb-4">颜色选择</h3>
              <div className="grid grid-cols-4 gap-3">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => { setColor(c); setIsEraser(false); }}
                    className={`w-10 h-10 rounded-full transition-transform hover:scale-110 ${
                      color === c && !isEraser ? "ring-4 ring-offset-2 ring-violet-500 scale-110" : ""
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={`选择颜色 ${c}`}
                  />
                ))}
              </div>
              <input
                type="color"
                value={color}
                onChange={(e) => { setColor(e.target.value); setIsEraser(false); }}
                className="w-full h-10 mt-4 rounded cursor-pointer"
              />
            </div>

            {/* Brush Size */}
            <div className="card">
              <h3 className="font-bold text-slate-800 mb-4">画笔大小</h3>
              <div className="space-y-3">
                {[3, 5, 8, 12, 20].map((size) => (
                  <button
                    key={size}
                    onClick={() => setBrushSize(size)}
                    className={`w-full py-2 rounded-lg transition-colors ${
                      brushSize === size ? "bg-violet-100 text-violet-700 font-semibold" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{size}px</span>
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: color }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Eraser */}
            <button
              onClick={() => setIsEraser(!isEraser)}
              className={`w-full py-4 rounded-xl font-bold transition-all ${
                isEraser
                  ? "bg-rose-100 text-rose-600 ring-2 ring-rose-500"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {isEraser ? "橡皮擦 (已开启)" : "启用橡皮擦"}
            </button>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={undo}
                disabled={historyIndex <= 0}
                className="w-full py-3 rounded-xl font-semibold bg-blue-100 text-blue-600 hover:bg-blue-200 disabled:opacity-50 transition-colors"
              >
                撤销
              </button>
              <button
                onClick={clearCanvas}
                className="w-full py-3 rounded-xl font-semibold bg-rose-100 text-rose-600 hover:bg-rose-200 transition-colors"
              >
                清空画布
              </button>
              <button
                onClick={saveImage}
                className="w-full py-3 rounded-xl font-semibold bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors"
              >
                保存作品
              </button>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="lg:col-span-3">
            <div className="card bg-white p-4">
              <div className="bg-white rounded-xl overflow-hidden shadow-inner">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="cursor-crosshair touch-none"
                />
              </div>
              <p className="text-center text-slate-500 mt-4 text-sm">
                使用鼠标或手指在画布上创作
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
