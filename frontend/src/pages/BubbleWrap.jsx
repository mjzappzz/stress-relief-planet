import { useState } from "react";
import useStore from "../store";

export function BubbleWrap() {
  const [bubbles, setBubbles] = useState(Array.from({length: 64}, (_, i) => ({id: i, popped: false, size: Math.random() * 20 + 40, color: Math.random() > 0.5 ? "bg-violet-400" : "bg-cyan-400"})));
  const [burstCount, setBurstCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { user } = useStore();

  const createBubble = (index) => {
    if (bubbles[index]) return;

    const newBubbles = [...bubbles];
    newBubbles[index] = {
      id: index,
      popped: false,
      size: Math.random() * 20 + 40, // 40-60px
      color: Math.random() > 0.5 ? "bg-violet-400" : "bg-cyan-400"
    };
    setBubbles(newBubbles);
  };

  const burstBubble = (index) => {
    if (!bubbles[index] || bubbles[index].popped) return;

    const newBubbles = [...bubbles];
    newBubbles[index] = { ...newBubbles[index], popped: true };
    setBubbles(newBubbles);
    setBurstCount(prev => prev + 1);

    // Auto-fill new bubbles periodically
    setTimeout(() => {
      createBubble(index);
    }, 1500 + Math.random() * 2000);
  };

  const fillAll = () => {
    setBubbles(Array(64).fill(null).map((_, i) => ({
      id: i,
      popped: false,
      size: Math.random() * 20 + 40,
      color: Math.random() > 0.5 ? "bg-violet-400" : "bg-cyan-400"
    })));
  };

  const clearAll = () => {
    setBubbles([]);
  };

  return (
    <div className="container mx-auto px-4 py-16 animate-fade-in min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            泡泡纸 <span className="text-violet-500">Bubble Wrap</span>
          </h1>
          <p className="text-lg text-slate-600">
            戳破泡泡，释放压力！点击或触摸泡泡即可爆破。
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="card-small text-center">
            <div className="text-3xl font-bold text-violet-600">{burstCount}</div>
            <div className="text-sm text-slate-500 mt-1">已爆破</div>
          </div>
          <div className="card-small text-center">
            <div className="text-3xl font-bold text-cyan-600">
              {(burstCount / 64 * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-slate-500 mt-1">完成度</div>
          </div>
          <div className="card-small text-center">
            <div className="text-3xl font-bold text-emerald-600">
              {Math.max(0, 64 - bubbles.filter(b => b).length)}
            </div>
            <div className="text-sm text-slate-500 mt-1">空闲</div>
          </div>
          <button
            onClick={fillAll}
            className="card-small text-center hover:bg-violet-50 cursor-pointer transition-colors"
          >
            <div className="text-3xl font-bold text-violet-600">+</div>
            <div className="text-sm text-slate-500 mt-1">重新填充</div>
          </button>
        </div>

        {/* Bubble Grid */}
        <div className="bg-gradient-to-br from-violet-50 to-cyan-50 rounded-3xl p-6 md:p-10 shadow-2xl">
          <div className="grid grid-cols-8 gap-3 md:gap-4 max-w-2xl mx-auto">
            {Array(64).fill(null).map((_, i) => {
              const bubble = bubbles[i];
              return (
                <button
                  key={i}
                  onClick={() => burstBubble(i)}
                  disabled={!bubble || bubble.popped}
                  className={`
                    relative w-10 h-10 md:w-12 md:h-12 rounded-full transition-all duration-300
                    ${!bubble ? "bg-transparent cursor-default" : ""}
                    ${bubble?.popped 
                      ? "bg-gradient-to-br from-slate-200 to-slate-300 shadow-inner scale-90 opacity-70" 
                      : `cursor-pointer shadow-lg hover:scale-110 active:scale-90 ${bubble?.color || ""} bg-gradient-to-br from-white/30 to-transparent`}
                  `}
                  aria-label={bubble?.popped ? "已爆破" : "未爆破的泡泡"}
                >
                  {!bubble?.popped && (
                    <div className="absolute top-1.5 left-1.5 w-2 h-2 bg-white rounded-full opacity-60 blur-[1px]"></div>
                  )}
                  {!bubble?.popped && (
                    <div className="absolute top-2 right-2 w-1 h-1 bg-white rounded-full opacity-40"></div>
                  )}
                  {!bubble?.popped && (
                    <div className="absolute bottom-1 left-2 w-3 h-1 bg-white rounded-full opacity-20 transform rotate-45"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-10 bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">💡</span> 如何使用
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center text-violet-600 font-bold flex-shrink-0">1</div>
              <div>
                <h3 className="font-semibold text-slate-800">点击泡泡</h3>
                <p className="text-sm text-slate-600 mt-1">点击任意未爆破的泡泡即可听到悦耳的爆破声</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center text-cyan-600 font-bold flex-shrink-0">2</div>
              <div>
                <h3 className="font-semibold text-slate-800">观察变化</h3>
                <p className="text-sm text-slate-600 mt-1">爆破后泡泡会留下痕迹，稍后会自动重新填充</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 font-bold flex-shrink-0">3</div>
              <div>
                <h3 className="font-semibold text-slate-800">放松心情</h3>
                <p className="text-sm text-slate-600 mt-1">专注于这个简单的动作，让压力慢慢消散</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
