import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";

// 👉 on prend la même logique d'API que le reste de l'app
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export default function Billing() {
  const [userId, setUserId] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUser() {
      const { data } = await supabase.auth.getUser();
      setUserId(data?.user?.id || null);
    }
    fetchUser();
  }, []);

  async function handleCheckout(planKey, credits) {
    if (!userId) {
      setError("No user connected!");
      return;
    }
    setError("");
    setLoadingId(planKey);
    try {
      const res = await fetch(`${API_BASE}/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, credits }),
      });

      if (!res.ok) throw new Error("Stripe server error");
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No Stripe URL returned");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to start checkout. Please try again later.");
    } finally {
      setLoadingId(null);
    }
  }

  const ACCENT = {
    text: "text-indigo-600",
    border: "border-indigo-500",
    hoverBorder: "hover:border-indigo-500",
    bg: "bg-indigo-600",
    hoverBg: "hover:bg-indigo-700",
    softBg: "bg-indigo-50",
    check: "text-indigo-500",
  };

  const plans = [
    {
      key: "starter",
      name: "Starter",
      credits: 100,
      price: 5,
      tagline: "Perfect to get started",
      perks: ["Great value for small usage", "€0.05 / email"],
      featured: false,
    },
    {
      key: "pro",
      name: "Pro",
      credits: 500,
      price: 20,
      tagline: "For regular users",
      perks: ["Ideal for customer analysis", "€0.04 / email"],
      featured: true,
    },
    {
      key: "master",
      name: "Master",
      credits: 2000,
      price: 70,
      tagline: "High-volume plan",
      perks: ["Thousands of emails in under 5 minutes", "Best deal: ~€0.035 / email"],
      featured: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm mb-4 backdrop-blur">
            <Sparkles className="w-4 h-4" />
            Credit Recharge
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Boost your Resumail analysis ⚡
          </h1>
          <p className="text-white/80 mt-2">
            Choose a plan that fits your usage. You can upgrade anytime.
          </p>
        </div>

        {/* Glass container */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 md:p-8 shadow-2xl">
          {error && (
            <p className="text-red-700 bg-red-50 border border-red-200 px-4 py-2 rounded-lg text-center mb-6">
              {error}
            </p>
          )}

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((p) => (
              <div
                key={p.key}
                className={[
                  "relative rounded-2xl bg-white shadow-sm border transition-all",
                  p.featured ? "border-indigo-300 shadow-indigo-100" : "border-gray-200 hover:shadow-md",
                ].join(" ")}
              >
                {p.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold px-3 py-1 rounded-full bg-indigo-600 text-white shadow-md">
                    Popular
                  </div>
                )}

                <div className="p-6">
                  <h2 className={`text-lg font-semibold ${ACCENT.text}`}>{p.name}</h2>
                  <p className="text-sm text-gray-500 mt-1">{p.tagline}</p>

                  <div className="mt-4 mb-4">
                    <span className="text-3xl font-bold text-gray-900">{p.price} €</span>
                    <span className="text-sm text-gray-500"> / {p.credits} credits</span>
                  </div>

                  <ul className="text-gray-700 text-sm space-y-2 mb-6">
                    {p.perks.map((perk, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className={`w-4 h-4 mt-0.5 ${ACCENT.check}`} />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    disabled={loadingId !== null}
                    onClick={() => handleCheckout(p.key, p.credits)}
                    className={[
                      "w-full py-2.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all",
                      p.featured ? ACCENT.bg : "bg-gray-900",
                      p.featured ? ACCENT.hoverBg : "hover:bg-gray-800",
                      loadingId && "opacity-75 cursor-not-allowed",
                    ].join(" ")}
                  >
                    {loadingId === p.key && <Loader2 className="w-4 h-4 animate-spin" />}
                    Purchase
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center text-white/80 text-xs mt-6">
            Secure payments powered by Stripe. Credits are applied instantly after purchase.
          </div>
        </div>
      </div>
    </div>
  );
}

