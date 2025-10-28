import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { Loader2, Sparkles } from "lucide-react";

const supabase = createClient(
  "https://hwoerudrnccwupsyxvxp.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3b2VydWRybmNjd3Vwc3l4dnhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MDQ2MTEsImV4cCI6MjA3NDI4MDYxMX0.nCHUlmk6QDl8Bv8IcbM7a2kMJblcDRziGSCI4ddv6vQ"
);

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  async function handleSignup(e) {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      if (!data.user) {
        setErrorMessage("Impossible de créer le compte. Veuillez réessayer.");
        return;
      }

      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-indigo-700 flex items-center justify-center px-6">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl w-full max-w-md p-8 border border-white/20">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold text-white">Créer un compte</h2>
          <p className="text-white/80 mt-2 text-sm">
            Rejoins Resumail et analyse ta boîte mail avec l’IA.
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-100/90 text-red-800 rounded-lg text-sm text-center">
              {errorMessage}
            </div>
          )}

          <input
            type="email"
            placeholder="Adresse e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/80 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
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
                : "bg-gradient-to-r from-pink-600 to-indigo-600 hover:opacity-90"
            }`}
          >
            {loading ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              "Créer un compte"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-white/80 mt-6">
          Déjà un compte ?{" "}
          <Link
            to="/login"
            className="text-white underline decoration-white/50 hover:decoration-white"
          >
            Connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
