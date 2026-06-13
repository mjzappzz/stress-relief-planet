import { Link } from "react-router-dom";
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                D
              </div>
              <span className="text-xl font-bold text-slate-800">解压星球</span>
            </Link>
            <p className="text-slate-600 mb-6 max-w-sm">
              专注于帮你释放压力、找到平静的线上空间。每天花几分钟，给自己一个放松的机会。
            </p>
            <div className="flex items-center gap-4">
              <span className="text-slate-400 text-sm">© {currentYear} 解压星球. All rights reserved.</span>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-slate-800 mb-4">活动项目</h3>
            <ul className="space-y-2">
              <li><a href="/bubble" className="text-slate-600 hover:text-violet-600 transition-colors">泡泡纸</a></li>
              <li><a href="/maze" className="text-slate-600 hover:text-violet-600 transition-colors">迷宫挑战</a></li>
              <li><a href="/coloring" className="text-slate-600 hover:text-violet-600 transition-colors">自由绘画</a></li>
              <li><a href="/breathing" className="text-slate-600 hover:text-violet-600 transition-colors">呼吸练习</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-slate-800 mb-4">我的</h3>
            <ul className="space-y-2">
              <li><a href="/stats" className="text-slate-600 hover:text-violet-600 transition-colors">我的记录</a></li>
              <li><a href="/profile" className="text-slate-600 hover:text-violet-600 transition-colors">个人资料</a></li>
              <li><a href="/login" className="text-slate-600 hover:text-violet-600 transition-colors">登录</a></li>
              <li><a href="/register" className="text-slate-600 hover:text-violet-600 transition-colors">注册</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
