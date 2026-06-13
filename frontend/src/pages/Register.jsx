import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useStore from "../store";

export function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    if (password.length < 6) {
      setError("密码长度至少为6位");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "注册失败");
      }

      login(data.token, data.user);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-800 mb-3">
            解压星球
          </h1>
          <p className="text-slate-600">创建账号，开始你的解压之旅</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div role="alert" className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="register-username" className="block text-sm font-medium text-slate-700">
                用户名
              </label>
              <input
                id="register-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                className="w-full min-h-11 px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="请输入用户名"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="register-email" className="block text-sm font-medium text-slate-700">
                邮箱
              </label>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full min-h-11 px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="请输入邮箱"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="register-password" className="block text-sm font-medium text-slate-700">
                密码
              </label>
              <input
                id="register-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full min-h-11 px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="请输入密码（至少6位）"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="register-confirm-password" className="block text-sm font-medium text-slate-700">
                确认密码
              </label>
              <input
                id="register-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full min-h-11 px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="请再次输入密码"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? "注册中..." : "注册账号"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            已有账号？{" "}
            <Link to="/login" className="text-blue-700 font-semibold hover:text-blue-800">
              立即登录
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
