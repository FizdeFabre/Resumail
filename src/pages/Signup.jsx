import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

// 🔥 Clés en dur juste pour test (à sécuriser plus tard !)
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

      // Succès : redirection vers le dashboard
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form onSubmit={handleSignup} className="bg-white p-6 rounded-xl shadow-md w-80">
        <h2 className="text-2xl font-bold mb-4 text-center">Créer un compte</h2>

        {errorMessage && (
          <div className="mb-3 p-2 bg-red-100 text-red-700 rounded text-sm">
            {errorMessage}
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 mb-3 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 mb-4 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
          required
        />
        <button
          type="submit"
          className={`w-full p-2 rounded text-white font-medium ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
          }`}
          disabled={loading}
        >
          {loading ? "Création en cours…" : "S’inscrire"}
        </button>

        <p className="mt-4 text-sm text-center text-gray-600">
          Déjà un compte ?{" "}
          <Link to="/login" className="text-indigo-600 hover:underline">
            Connexion
          </Link>
        </p>
      </form>
    </div>
  );
}