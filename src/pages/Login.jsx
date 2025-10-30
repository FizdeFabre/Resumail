import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, Mail } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const user = data.user;
    if (user) {
      await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email,
      });
      navigate("/dashboard");
    }
    setLoading(false);
  }


return (
  <div className="min-h-screen bg-indigo-700 flex items-center justify-center px-6">
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl w-full max-w-md p-8 border border-white/20">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
          <Mail className="text-white w-6 h-6" />
        </div>
        <h2 className="text-3xl font-bold text-white">Login</h2>
        <p className="text-white/80 mt-2 text-sm">
          Access your Resumail dashboard.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded-lg bg-white/80 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded-lg bg-white/80 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 ${
            loading
              ? "bg-white/30 cursor-not-allowed"
              : "bg-blue-900 hover:opacity-90"
          }`}
        >
          {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Log in"}
        </button>
      </form>

      <p className="text-center text-sm text-white/80 mt-6">
        Don’t have an account?{" "}
        <Link
          to="/signup"
          className="text-white underline decoration-white/50 hover:decoration-white"
        >
          Create one
        </Link>
      </p>
    </div>
  </div>
);

}
