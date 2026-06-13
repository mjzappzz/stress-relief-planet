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
          ? "bg-white/92 backdrop-blur-md shadow-sm border-b border-orange-100"
          : "bg-white/70 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-full items-center justify-between">
          <Link to="/" className="flex min-h-11 items-center gap-3 rounded-xl pr-2 group">
            <div className="w-10 h-10 shrink-0 bg-orange-500 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-sm group-hover:bg-orange-600 transition-colors">
              星
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
                className={`rounded-full px-3 py-2 text-sm font-semibold transition-colors ${
                  location.pathname === link.path
                    ? "bg-orange-100 text-orange-900"
                    : "text-slate-600 hover:bg-white hover:text-orange-800"
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
                <Link to="/stats" className="rounded-lg px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50">
                  我的记录
                </Link>
                <button
                  onClick={logout}
                  className="min-h-11 px-4 py-2 text-sm font-semibold text-rose-700 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors"
                >
                  退出
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="min-h-11 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
              >
                登录
              </Link>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="min-h-11 min-w-11 rounded-xl p-2 text-slate-700 hover:bg-orange-50"
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
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-orange-100 shadow-lg animate-slide-in">
          <div className="px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block rounded-xl px-4 py-3 text-lg font-medium transition-colors ${
                  location.pathname === link.path
                    ? "bg-orange-100 text-orange-900"
                    : "text-slate-700 hover:bg-orange-50 hover:text-orange-800"
                }`}
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
                    className="block text-center px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl"
                  >
                    我的记录
                  </Link>
                  <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                    className="w-full text-center px-4 py-3 text-rose-700 font-semibold hover:bg-rose-50 rounded-xl"
                  >
                    退出登录
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-center px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl"
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
