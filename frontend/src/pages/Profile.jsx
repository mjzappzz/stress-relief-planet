import { useState, useEffect } from "react";
import useStore from "../store";

export function Profile() {
  const { user, logout } = useStore();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/progress/stats");
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error("获取统计失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const activityStats = stats?.filter(s => s.count > 0) || [];

  return (
    <div className="container mx-auto px-4 py-16 animate-fade-in min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-800 mb-10">个人资料</h1>

        {/* User Card */}
        <div className="card mb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold">
              {user.username[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-800">{user.username}</h2>
              <p className="text-slate-600">{user.email}</p>
              <p className="text-sm text-slate-500 mt-1">注册时间: {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Activity Stats */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6">活动记录</h2>
          
          {isLoading ? (
            <div className="text-center py-8 text-slate-500">加载中...</div>
          ) : activityStats.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              暂无活动记录，快去体验有趣的活动吧！
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {activityStats.map((stat, index) => (
                <div key={stat.type} className="bg-gradient-to-br from-violet-50 to-cyan-50 rounded-xl p-4 text-center">
                  <div className="text-4xl font-bold text-violet-600 mb-2">{stat.count}</div>
                  <div className="text-sm font-medium text-slate-700">{stat.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Logout Button */}
        <div className="flex justify-center">
          <button
            onClick={logout}
            className="px-8 py-3 bg-rose-100 text-rose-600 font-bold rounded-xl hover:bg-rose-200 transition-colors"
          >
            退出登录
          </button>
        </div>
      </div>
    </div>
  );
}
