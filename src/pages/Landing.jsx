// src/pages/Landing.jsx
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
      <div className="max-w-md w-full text-center px-6 py-12 bg-white/10 rounded-2xl shadow-lg">
        <h1 className="text-5xl font-bold mb-6 text-white">📨 Resumail</h1>
        <p className="text-lg mb-10 text-white/90">
          Transforme ta boîte mail en résumé clair et exploitable.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link to="/login">
            <button className="px-6 py-3 rounded-xl bg-white text-indigo-600 font-semibold hover:bg-gray-200 transition">
              Se connecter
            </button>
          </Link>
          <Link to="/signup">
            <button className="px-6 py-3 rounded-xl bg-indigo-700 font-semibold hover:bg-indigo-800 transition">
              Créer un compte
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}