import { Link, useLocation } from "react-router-dom";
import useStore from "../store";

export function Navbar({ isMenuOpen, setIsMenuOpen, scrolled }) {
  const { user, logout } = useStore();
  const location = useLocation();
  const isActiveSurface = scrolled || isMenuOpen;

  const navLinks = [
    { name: "首页", path: "/" },
    { name: "泡泡纸", path: "/bubble" },
    { name: "迷宫", path: "/maze" },
    { name: "绘画", path: "/coloring" },
    { name: "呼吸", path: "/breathing" },
    { name: "钢琴", path: "/piano" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full h-20 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-200 ${
        isActiveSurface
          ? "bg-white/90 backdrop-blur-md shadow-lg"
          : "bg-white/0"
      }`}
    >
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-full items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 shrink-0 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg group-hover:scale-105 transition-transform">
              D
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-800">
              解压星球
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-semibold transition-colors hover:text-violet-500 ${
                  location.pathname === link.path
                    ? "text-violet-600"
                    : isActiveSurface ? "text-slate-600" : "text-slate-700"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-slate-700 font-medium">
                  {user.username}
                </span>
                <Link to="/stats" className="text-sm font-semibold text-violet-600 hover:text-violet-700">
                  我的记录
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-semibold text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors"
                >
                  退出
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-5 py-2.5 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 transition-colors shadow-md hover:shadow-lg"
              >
                登录
              </Link>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-slate-700 focus:outline-none"
              aria-label={isMenuOpen ? "关闭菜单" : "打开菜单"}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 shadow-xl animate-slide-in">
          <div className="px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className="block text-lg font-medium text-slate-700 hover:text-violet-600 hover:bg-violet-50 px-4 py-3 rounded-xl transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-slate-100">
              {user ? (
                <div className="space-y-3">
                  <div className="text-slate-700 font-medium px-4">
                    {user.username}
                  </div>
                  <Link
                    to="/stats"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-center px-4 py-3 bg-violet-600 text-white font-semibold rounded-lg"
                  >
                    我的记录
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-center px-4 py-3 text-rose-600 font-semibold hover:bg-rose-50 rounded-lg"
                  >
                    退出登录
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-center px-4 py-3 bg-violet-600 text-white font-semibold rounded-lg"
                >
                  登录
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
