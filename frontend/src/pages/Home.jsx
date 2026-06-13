import { Link } from "react-router-dom";
import { FaChartLine, FaDrawPolygon, FaMusic, FaPalette, FaRegCircle, FaRoute, FaWind } from "react-icons/fa";

export function Home() {
  const activities = [
    {
      id: 1,
      title: "泡泡纸",
      description: "戳破泡泡，释放压力",
      Icon: FaRegCircle,
      color: "bg-rose-100 text-rose-700",
      path: "/bubble"
    },
    {
      id: 2,
      title: "迷宫挑战",
      description: "寻找出口，专注当下",
      Icon: FaRoute,
      color: "bg-blue-100 text-blue-700",
      path: "/maze"
    },
    {
      id: 3,
      title: "自由绘画",
      description: "挥洒创意，放松心情",
      Icon: FaPalette,
      color: "bg-orange-100 text-orange-800",
      path: "/coloring"
    },
    {
      id: 4,
      title: "呼吸练习",
      description: "4-7-8法，平静心神",
      Icon: FaWind,
      color: "bg-cyan-100 text-cyan-800",
      path: "/breathing"
    },
    {
      id: 5,
      title: "钢琴弹奏",
      description: "音乐疗愈，沉浸其中",
      Icon: FaMusic,
      color: "bg-emerald-100 text-emerald-800",
      path: "/piano"
    }
  ];

  return (
    <div className="animate-fade-in">
      <div className="px-4 py-16 md:py-20">
        <div className="max-w-6xl mx-auto grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
          <div className="mb-5 inline-flex items-center rounded-full border border-orange-200 bg-white/80 px-4 py-2 text-sm font-semibold text-orange-900 shadow-sm">
            5 个轻量练习，随时开始
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight leading-tight">
            解压星球
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl leading-relaxed">
            用泡泡、迷宫、绘画、呼吸和音乐，把零散时间变成可记录的放松练习。
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/bubble" className="btn-primary w-full sm:w-auto px-8 py-4 text-lg">
              立即开始解压
            </Link>
            <Link to="/stats" className="btn-secondary w-full sm:w-auto px-8 py-4 text-lg">
              查看记录
            </Link>
          </div>
        </div>
          <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              {activities.slice(0, 4).map(({ id, title, Icon, color, path }) => (
                <Link key={id} to={path} className="group rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-orange-200 hover:bg-orange-50">
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </div>
                  <div className="font-bold text-slate-900 group-hover:text-orange-900">{title}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              选择你的解压方式
            </h2>
            <p className="text-lg text-slate-600">
              不同状态选择不同练习，完成后自动记录使用情况
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activities.map((activity) => (
              <Link
                key={activity.id}
                to={activity.path}
                className="card group overflow-hidden hover:-translate-y-1 hover:border-orange-200 hover:shadow-md"
              >
                <div className={`h-24 w-24 ${activity.color} rounded-2xl mb-6 flex items-center justify-center transition-transform duration-300 group-hover:scale-105`}>
                  <activity.Icon aria-hidden="true" className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-orange-900 transition-colors">
                  {activity.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {activity.description}
                </p>
                <div className="mt-4 flex items-center text-blue-700 font-semibold group-hover:translate-x-1 transition-transform">
                  开始体验
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="py-20 bg-orange-50/70">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-sm text-orange-700">
                <FaWind aria-hidden="true" className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">快速减压</h3>
              <p className="text-slate-600">随时随地，一键进入解压模式，释放日常压力</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-sm text-blue-700">
                <FaDrawPolygon aria-hidden="true" className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">多样选择</h3>
              <p className="text-slate-600">5种不同类型的活动，总能找到适合你的</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-sm text-emerald-700">
                <FaChartLine aria-hidden="true" className="h-7 w-7" />
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
