import { Link } from "react-router-dom";

export function Home() {
  const activities = [
    {
      id: 1,
      title: "泡泡纸",
      description: "戳破泡泡，释放压力",
      icon: "泡泡",
      color: "from-pink-400 to-rose-500",
      path: "/bubble"
    },
    {
      id: 2,
      title: "迷宫挑战",
      description: "寻找出口，专注当下",
      icon: "迷宫",
      color: "from-violet-500 to-indigo-600",
      path: "/maze"
    },
    {
      id: 3,
      title: "自由绘画",
      description: "挥洒创意，放松心情",
      icon: "画笔",
      color: "from-amber-400 to-orange-500",
      path: "/coloring"
    },
    {
      id: 4,
      title: "呼吸练习",
      description: "4-7-8法，平静心神",
      icon: "呼吸",
      color: "from-cyan-400 to-blue-500",
      path: "/breathing"
    },
    {
      id: 5,
      title: "钢琴弹奏",
      description: "音乐疗愈，沉浸其中",
      icon: "琴键",
      color: "from-emerald-400 to-green-600",
      path: "/piano"
    },
    {
      id: 6,
      title: "悄悄话树洞",
      description: "写下一点心事，先放在这里",
      icon: "✧",
      color: "from-slate-700 to-indigo-950",
      path: "/whisper"
    }
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-rose-50 to-cyan-50 py-20 px-4">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-800 mb-6 tracking-tight">
            解压星球 <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-cyan-500">Decompress</span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            在这里，找到属于你的宁静时刻。多种解压活动，助你释放压力，重拾平静。
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/bubble" className="btn-primary w-full sm:w-auto px-8 py-4 text-lg">
              立即开始解压
            </Link>
            <Link to="/stats" className="btn-secondary w-full sm:w-auto px-8 py-4 text-lg">
              查看记录
            </Link>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-violet-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
        <div className="absolute top-10 right-10 w-32 h-32 bg-rose-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: "1s" }}></div>
        <div className="absolute bottom-10 left-1/2 w-32 h-32 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: "2s" }}></div>
      </div>

      {/* Features Grid */}
      <div className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              选择你的解压方式
            </h2>
            <p className="text-lg text-slate-600">
              6种精心设计的解压活动，总有一款适合你
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activities.map((activity) => (
              <Link
                key={activity.id}
                to={activity.path}
                className="card group overflow-hidden"
              >
                <div className={`h-32 bg-gradient-to-br ${activity.color} rounded-xl mb-6 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300`}>
                  <span className="text-6xl text-white drop-shadow-lg">{activity.icon}</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-violet-600 transition-colors">
                  {activity.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {activity.description}
                </p>
                <div className="mt-4 flex items-center text-violet-600 font-semibold group-hover:translate-x-2 transition-transform">
                  开始体验 →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-gradient-to-br from-violet-50 to-cyan-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg text-3xl">
                🧘
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">快速减压</h3>
              <p className="text-slate-600">随时随地，一键进入解压模式，释放日常压力</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg text-3xl">
                🎨
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">多样选择</h3>
              <p className="text-slate-600">5种不同类型的活动，总能找到适合你的</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg text-3xl">
                📊
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">追踪记录</h3>
              <p className="text-slate-600">记录每次解压历程，见证自己的改变</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
