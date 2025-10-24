// src/pages/Dashboard.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import axios from "axios";
import { Button } from "@/components/ui/Button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/Alert";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useCredits } from "@/pages/CreditContext";
import { motion } from "framer-motion";
import { Zap, Rocket } from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

const PIE_COLORS = ["#7C3AED", "#F472B6", "#EF4444"]; // violet, rose, red
const API_BASE = import.meta.env.VITE_API_BASE;

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { credits, updateCredits } = useCredits();
  const [localCredits, setLocalCredits] = useState(null);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [lineData, setLineData] = useState([]);
  const navigate = useNavigate();

  const ensureCreditsLoaded = useCallback(
    async (userId) => {
      try {
        const { data: pRow, error: pErr } = await supabase
          .from("profiles")
          .select("credits")
          .eq("id", userId)
          .single();
        if (!pErr && pRow) {
          setLocalCredits(pRow.credits ?? 0);
          return;
        }
      } catch (e) {
        console.warn("[Dashboard] error reading credits:", e);
      }
      setLocalCredits((prev) => prev ?? credits ?? 0);
    },
    [credits]
  );

  function buildLineData(reports) {
    const map = {};
    reports.forEach((r) => {
      const date = r.created_at ? new Date(r.created_at).toISOString().slice(0, 10) : "unknown";
      map[date] = map[date] || 0;
      map[date] += Number(r.total_emails || 0);
    });
    return Object.keys(map)
      .sort()
      .map((d) => ({ date: d, emails: map[d] }));
  }

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        // 1) Auth
        const { data: userData, error: authErr } = await supabase.auth.getUser();
        if (authErr) throw authErr;
        const currentUser = userData?.user ?? null;
        if (!currentUser) {
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
          return;
        }
        if (mounted) setUser(currentUser);

        // 2) Credits
        await ensureCreditsLoaded(currentUser.id);

        // 3) Stats (backend)
        let statsObj = null;
        try {
          const statsRes = await axios.get(`${API_BASE}/stats/${currentUser.id}`);
          statsObj = statsRes.data;
        } catch (e) {
          console.warn("[Dashboard] /stats fetch failed, will compute from reports:", e.message || e);
        }

        // 4) Reports (history) - try both user_id and user fields
        let reports = [];
        try {
          const [{ data: reportsByUserId, error: err1 }, { data: reportsByUser, error: err2 }] = await Promise.all([
            supabase
              .from("reports")
              .select("id, report_text, sentiment_overall, classification, total_emails, created_at, is_final, mini_report_ids")
              .eq("user_id", currentUser.id)
              .order("created_at", { ascending: false })
              .limit(200),
            supabase
              .from("reports")
              .select("id, report_text, sentiment_overall, classification, total_emails, created_at, is_final, mini_report_ids")
              .eq("user", currentUser.id)
              .order("created_at", { ascending: false })
              .limit(200),
          ]);

          if (err1) console.warn("[Dashboard] reports user_id fetch error:", err1);
          if (err2) console.warn("[Dashboard] reports user fetch error:", err2);

          const allReports = [...(reportsByUserId || []), ...(reportsByUser || [])];
          const uniqueReports = Array.from(new Map(allReports.map((r) => [r.id, r])).values());

          reports = uniqueReports.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 200);
        } catch (repErr) {
          console.error("[Dashboard] reports fetch fatal error:", repErr);
          throw repErr;
        }

        // normalize
        const normalized = (reports || []).map((r) => ({
          id: r.id,
          report_text: r.report_text ?? "",
          sentiment_overall: r.sentiment_overall ?? r.classification ?? {},
          total_emails: r.total_emails ?? 0,
          created_at: r.created_at,
          is_final: r.is_final ?? false,
        }));

        if (mounted) {
          setHistory(normalized);

          if (!statsObj) {
            const totalEmails = normalized.reduce((s, x) => s + (Number(x.total_emails) || 0), 0);
            const avg = { positive: 0, neutral: 0, negative: 0, other: 0 };
            normalized.forEach((x) => {
              const snts = x.sentiment_overall || {};
              avg.positive += Number(snts.positive || 0);
              avg.neutral += Number(snts.neutral || 0);
              avg.negative += Number(snts.negative || 0);
              avg.other += Number(snts.other || 0);
            });
            const count = normalized.length || 1;
            avg.positive = Math.round(avg.positive / count);
            avg.neutral = Math.round(avg.neutral / count);
            avg.negative = Math.round(avg.negative / count);
            avg.other = Math.round(avg.other / count);

            statsObj = {
              total_emails: totalEmails,
              avg,
              last_summary: normalized[0]?.report_text ?? "",
            };
          }

          setStats({
            total_emails: statsObj.total_emails ?? 0,
            avg: statsObj.avg ?? { positive: 0, neutral: 0, negative: 0, other: 0 },
            last_summary: statsObj.last_summary ?? "",
          });

          setLineData(buildLineData(normalized));
        }
      } catch (err) {
        console.error("Erreur dashboard loadData:", err);
        if (mounted) setError("Impossible de charger les données du dashboard.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        ensureCreditsLoaded(session.user.id).catch((e) => console.warn(e));
      }
    });

    return () => {
      try {
        if (subscription && typeof subscription.unsubscribe === "function") subscription.unsubscribe();
      } catch (e) {}
    };
  }, [ensureCreditsLoaded]);

  const downloadReportPdf = async (id) => {
    if (!id) return alert("Aucun ID de rapport disponible.");
    try {
      const url = `${API_BASE}/reports/${id}/pdf`;
      window.open(url, "_blank");
    } catch (e) {
      console.error("downloadReportPdf error:", e);
      alert("Erreur lors de l'ouverture du PDF (voir console).");
    }
  };

  // small derived data for charts
  const pieData = [
    { name: "Positifs", value: stats?.avg?.positive ?? 0 },
    { name: "Neutres", value: stats?.avg?.neutral ?? 0 },
    { name: "Négatifs", value: stats?.avg?.negative ?? 0 },
  ];

  if (loading) return <div className="p-6 text-gray-500">Chargement…</div>;

  if (!user)
    return (
      <div className="p-6">
        <Alert>
          <AlertDescription>Connecte-toi avec Resumail pour accéder au dashboard.</AlertDescription>
        </Alert>
      </div>
    );

return (
  <div className="p-8 max-w-7xl mx-auto space-y-10">
    {/* HEADER */}
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-4">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Bienvenue, <span className="text-violet-600 font-bold">{user.email}</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">Résumé rapide & historique — Resumail</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Crédits restants</p>
          <p className="text-2xl font-extrabold text-violet-600">
            {Number(localCredits ?? credits ?? 0)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate("/");
            }}
          >
            Déconnexion
          </Button>
          <Button onClick={() => navigate("/billing")}>Recharge</Button>
        </div>
      </div>
    </header>

    {/* GMAIL LINK */}
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            Connexion Gmail
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-gray-600 text-sm leading-relaxed">
            Connecte ta boîte Gmail pour activer les filtres et générer des rapports automatiques.
          </p>
          <div className="flex gap-3">
            <Button
              className="bg-violet-600 hover:bg-violet-700 text-white"
              onClick={() => (window.location.href = `${API_BASE}/auth/google`)}
            >
              Connecter Gmail
            </Button>
            <Button variant="outline" onClick={() => navigate("/filters")}>
              Voir les filtres
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>

    {/* DASHBOARD STATS */}
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      {/* Total emails */}
      <Card className="shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle>Total d’emails analysés</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-extrabold text-violet-600">
            {stats?.total_emails ?? 0}
          </p>
          <p className="text-sm text-gray-500 mt-2">Dernier résumé :</p>
          <p className="text-sm text-gray-700 mt-1 line-clamp-3">
            {stats?.last_summary ?? "—"}
          </p>
        </CardContent>
      </Card>

      {/* PieChart sentiments */}
      <Card className="shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle>Répartition des sentiments</CardTitle>
        </CardHeader>
        <CardContent style={{ height: 220 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={44}
                outerRadius={80}
                paddingAngle={4}
              >
                {pieData.map((entry, idx) => (
                  <Cell
                    key={`cell-${idx}`}
                    fill={PIE_COLORS[idx % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v}`} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* LineChart emails trend */}
      <Card className="shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle>Tendance — Emails traités</CardTitle>
        </CardHeader>
        <CardContent style={{ height: 220 }}>
          <ResponsiveContainer>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="emails"
                stroke="#7C3AED"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>

    {/* HISTORIQUE DES RAPPORTS */}
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-violet-700 text-lg font-semibold">
            Historique des rapports finaux
          </CardTitle>
          <p className="text-sm text-gray-500">
            Consulte et télécharge tes analyses complètes.
          </p>
        </CardHeader>
        <CardContent>
          {history.filter((r) => r.is_final).length === 0 ? (
            <p className="text-gray-500 italic text-sm">
              Aucun rapport final enregistré pour l’instant.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">
                      Date
                    </th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">
                      Emails
                    </th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">
                      Résumé
                    </th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history
                    .filter((r) => r.is_final)
                    .sort(
                      (a, b) => new Date(b.created_at) - new Date(a.created_at)
                    )
                    .map((r) => (
                      <tr
                        key={r.id}
                        className="border-b hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-2 text-gray-700">
                          {new Date(r.created_at).toLocaleString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-4 py-2 text-center">
                          {r.total_emails || 0}
                        </td>
                        <td className="px-4 py-2 max-w-xs truncate text-gray-600">
                          {r.report_text?.slice(0, 120) || "—"}
                        </td>
                        <td className="px-4 py-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-violet-600 border-violet-200 hover:bg-violet-50"
                            onClick={() => downloadReportPdf(r.id)}
                          >
                            Télécharger PDF
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>

    {/* CTA RECHARGE */}
    <div className="bg-gradient-to-r from-violet-50 to-pink-50 border border-violet-100 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Zap className="text-violet-600" size={18} />
          Booster de crédits
        </h2>
        <p className="text-gray-600 text-sm mt-1">
          Il te reste{" "}
          <span className="font-semibold text-violet-700">
            {Number(localCredits ?? credits ?? 0)}
          </span>{" "}
          crédits. Recharge maintenant pour analyser plus d'emails.
        </p>
      </div>
      <div className="flex gap-3">
        <Button
          onClick={() => navigate("/billing")}
          className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-2 rounded-xl flex items-center gap-2"
        >
          <Rocket size={16} /> Booster maintenant
        </Button>
        <Button
          variant="outline"
          onClick={() => updateCredits && updateCredits(user.id, 100)}
        >
          +100 (test)
        </Button>
      </div>
    </div>

    {/* FOOTER ERRORS */}
    {error && (
      <Alert className="mt-4 border-red-300 bg-red-50">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )}
  </div>
);

}