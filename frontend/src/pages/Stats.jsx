import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useStore from "../store";

export function Stats() {
  const { user } = useStore();
  const [progress, setProgress] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchProgress();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/progress/stats");
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error("获取统计失败:", error);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await fetch("/api/progress");
      const data = await response.json();
      setProgress(data);
    } catch (error) {
      console.error("获取记录失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalDuration = progress.reduce((sum, p) => sum + p.duration, 0);
  const totalSessions = progress.length;

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}小时${mins}分钟`;
  };

  const activityStats = stats?.filter(s => s.count > 0) || [];

  return (
    <div className="container mx-auto px-4 py-16 animate-fade-in min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-bold text-slate-800">我的记录</h1>
          <Link to="/profile" className="text-violet-600 font-semibold hover:underline">
            返回个人资料
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="card bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
            <div className="text-4xl font-bold mb-2">{totalSessions}</div>
            <div className="text-violet-100">总参与次数</div>
          </div>
          
          <div className="card bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
            <div className="text-4xl font-bold mb-2">{formatDuration(totalDuration)}</div>
            <div className="text-cyan-100">总时长</div>
          </div>
          
          <div className="card bg-gradient-to-br from-emerald-500 to-green-600 text-white">
            <div className="text-4xl font-bold mb-2">{activityStats.length}</div>
            <div className="text-emerald-100">体验类型</div>
          </div>
        </div>

        {/* Activity Breakdown */}
        <div className="card mb-10">
          <h2 className="text-xl font-bold text-slate-800 mb-6">活动统计</h2>
          
          {activityStats.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              暂无活动记录
            </div>
          ) : (
            <div className="space-y-4">
              {activityStats.map((stat) => (
                <div key={stat.type} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center text-2xl">
                    {stat.type === "bubble" ? "🫧" :
                     stat.type === "maze" ? "🧩" :
                     stat.type === "coloring" ? "🎨" :
                     stat.type === "breathing" ? "🌬️" : "🎹"}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-slate-800">{stat.name}</span>
                      <span className="text-slate-600">{stat.count} 次</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-violet-500 to-cyan-500 h-2 rounded-full"
                        style={{ width: `${(stat.count / activityStats.reduce((max, s) => Math.max(max, s.count), 0)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Sessions */}
        <div className="card">
          <h2 className="text-xl font-bold text-slate-800 mb-6">最近记录</h2>
          
          {isLoading ? (
            <div className="text-center py-8 text-slate-500">加载中...</div>
          ) : progress.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              暂无记录
            </div>
          ) : (
            <div className="space-y-3">
              {progress.slice(0, 10).map((item) => (
                <div key={item._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-xl">
                      {item.activityType === "bubble" ? "🫧" :
                       item.activityType === "maze" ? "🧩" :
                       item.activityType === "coloring" ? "🎨" :
                       item.activityType === "breathing" ? "🌬️" : "🎹"}
                    </div>
                    <div>
                      <div className="font-medium text-slate-800">
                        {item.description || "解压活动"}
                      </div>
                      <div className="text-sm text-slate-500">
                        {new Date(item.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-violet-600">
                      {Math.floor(item.duration / 60)} 分钟
                    </div>
                    <div className="text-sm text-slate-500">参与 {item.sessions || 1} 次</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
