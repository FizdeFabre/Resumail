// src/App.jsx
import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Filters from "./pages/Filters";
import Billing from "./pages/Billing";
import Dashboard from "./pages/Dashboard";
import AnalyzePage from "./pages/analyze";
import { CreditProvider } from "./pages/CreditContext"; // ✅ import nommé
import Terms from "./pages/terms";
import Privacy from "./pages/privacy";

function AuthSuccess() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gmail = params.get("user") || params.get("gmail_user");
    if (gmail) {
      localStorage.setItem("gmailUser", gmail); // 🔥 clé cohérente avec Dashboard.jsx
      window.location.href = "/dashboard"; // retour forcé Dashboard
    }
  }, []);

  return <p>Connexion Gmail réussie ! Redirection...</p>;
}

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const gmailUser = localStorage.getItem("gmailUser");

  return (
    <CreditProvider> {/* ✅ contexte bien appliqué */}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard session={session} />} />
        <Route path="/filters" element={<Filters session={session} />} />
        <Route path="/billing" element={<Billing session={session} />} />
        <Route path="/auth/success" element={<AuthSuccess />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />

        {/* Protégé : accessible seulement si Gmail + Supabase */}
        <Route
          path="/filters"
          element={
            session && gmailUser ? <Filters /> : <Navigate to="/dashboard" />
          }
        />

        {/* Protégé : analyse seulement après mails */}
        <Route
          path="/analyze"
          element={
            session && gmailUser ? <AnalyzePage /> : <Navigate to="/dashboard" />
          }
        />
      </Routes>
    </CreditProvider>
  );
}