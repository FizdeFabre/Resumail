import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { CheckCircle, Loader2 } from "lucide-react";

export default function Billing() {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUser() {
      const { data } = await supabase.auth.getUser();
      setUserId(data?.user?.id || null);
    }
    fetchUser();
  }, []);

  async function handleCheckout(credits) {
    if (!userId) {
      setError("Aucun utilisateur connecté !");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:3000/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, credits }),
      });

      if (!res.ok) throw new Error("Erreur serveur Stripe");
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Aucune URL Stripe retournée");
      }
    } catch (err) {
      console.error(err);
      setError("Impossible de lancer le paiement. Réessaie plus tard.");
    } finally {
      setLoading(false);
    }
  }

  const plans = [
    {
      name: "Starter",
      credits: 100,
      price: 5,
      color: "purple",
      perks: ["Idéal pour tester", " Bon rapport quantité/prix ", "0,05 euro/email"],
    },
    {
      name: "Pro",
      credits: 500,
      price: 20,
      color: "purple",
      perks: ["Parfait pour usage régulier", " Pafait pour plusieurs centaines de retours clients", "0,04 euro/email"],
    },
    {
      name: "Master",
      credits: 2000,
      price: 70,
      color: "purple",
      perks: [" Des milliers d'email synthétisé en moins de 5 minutes !", "Meilleur rapport qualité/prix : 0,035 euro/email ! "],
    },
  ];

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-10 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl shadow-lg border border-gray-200">
      <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-4">
        Recharge tes crédits Resumail ⚡
      </h1>
      <p className="text-center text-gray-500">
        Sélectionne le pack qui correspond à ton usage.
      </p>

      {error && (
        <p className="text-red-600 text-center font-medium bg-red-50 p-2 rounded-xl">
          {error}
        </p>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`bg-white rounded-2xl p-6 border-2 hover:border-${p.color}-500 transition-all shadow-sm hover:shadow-md`}
          >
            <h2 className={`text-${p.color}-600 text-lg font-semibold`}>
              {p.name}
            </h2>
            <p className="text-3xl font-bold mt-2 mb-4">
              {p.price} €{" "}
              <span className="text-sm text-gray-500 font-medium">
                / {p.credits} crédits
              </span>
            </p>

            <ul className="text-gray-600 text-sm mb-6 space-y-2">
              {p.perks.map((perk, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle
                    size={14}
                    className={`text-${p.color}-500 shrink-0`}
                  />
                  {perk}
                </li>
              ))}
            </ul>

            <button
              disabled={loading}
              onClick={() => handleCheckout(p.credits)}
              className={`w-full py-2.5 text-white rounded-xl font-semibold bg-${p.color}-600 hover:bg-${p.color}-700 transition-all flex items-center justify-center`}
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin mr-2" />
              ) : null}
              Acheter
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}