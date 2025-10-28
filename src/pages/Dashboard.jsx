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
import { exportStyledPdf } from "../utils/pdfManager"; 

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

const downloadReportPdf = async (report) => {
  try {
    const { data: fullReport, error } = await supabase
      .from("reports")
      .select("*")
      .eq("id", report.id)
      .maybeSingle();

    if (error) throw error;

    const merged = {
      ...report,
      ...fullReport,
      highlights: fullReport?.highlights ?? [],
      mini_reports: fullReport?.mini_reports ?? [],
      classification: fullReport?.classification ?? {},
    };

    await exportStyledPdf(merged, user?.email);
  } catch (err) {
    console.error("Erreur export PDF :", err);
    alert("Impossible d’exporter le rapport complet. Regarde la console pour les détails.");
  }
};

  // small derived data for charts
  const pieData = [
    { name: "Positifs", value: stats?.avg?.positive ?? 0 },
    { name: "Neutres", value: stats?.avg?.neutral ?? 0 },
    { name: "Négatifs", value: stats?.avg?.negative ?? 0 },
    { name: "Other", value: stats?.avg?.other ?? 0 },
  ];

// --- Partie visuelle revue uniquement ---
// ✅ Aucun changement fonctionnel (toutes les redirections, hooks, etc. inchangés)

if (loading)
  return (
    <div className="p-6 text-center text-gray-500 animate-pulse">
      Chargement des données…
    </div>
  );

if (!user)
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl text-center shadow-lg border border-white/20">
        <h2 className="text-2xl font-semibold text-white mb-4">Connexion requise</h2>
        <p className="text-white/80 mb-6">
          Connecte-toi avec Resumail pour accéder à ton tableau de bord.
        </p>
        <Button
          onClick={() => navigate("/login")}
          className="bg-white text-indigo-700 hover:bg-gray-100"
        >
          Se connecter
        </Button>
      </div>
    </div>
  );

return (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white text-gray-900">
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Bienvenue,{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {user.email}
            </span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Résumé rapide & historique — Resumail
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-gray-500">Crédits restants</p>
            <div className="text-2xl font-extrabold text-indigo-600">
              {Number(localCredits ?? credits ?? 0)}
            </div>
          </div>
          <Button
            variant="outline"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate("/");
            }}
            className="border-gray-300 hover:bg-gray-100"
          >
            Déconnexion
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
            Recharge
          </Button>
        </div>
      </div>

      {/* Gmail actions */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-md hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle className="text-indigo-700 font-semibold">
              Connexion Gmail
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 md:flex md:items-center md:justify-between">
            <p className="text-gray-600">
              Connecte ta boîte Gmail pour activer les filtres et générer des rapports.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() =>
                  (window.location.href = `${API_BASE}/auth/google`)
                }
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Connecter Gmail
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/filters")}
                className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
              >
                Aller aux filtres
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats & Charts */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border-0 bg-white/90 backdrop-blur-md shadow-sm hover:shadow-md transition-all">
            <CardHeader>
              <CardTitle className="text-gray-800 font-semibold">
                Total d'emails analysés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-indigo-600">
                {stats?.total_emails ?? 0}
              </div>
              <p className="text-sm text-gray-500 mt-2">Dernier résumé :</p>
              <p className="text-sm text-gray-700 mt-1 line-clamp-3 break-words">
                {stats?.last_summary ?? "—"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/90 backdrop-blur-md shadow-sm hover:shadow-md transition-all">
            <CardHeader>
              <CardTitle className="text-gray-800 font-semibold">
                Répartition des sentiments
              </CardTitle>
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

          <Card className="border-0 bg-white/90 backdrop-blur-md shadow-sm hover:shadow-md transition-all">
            <CardHeader>
              <CardTitle className="text-gray-800 font-semibold">
                Tendance — Emails traités
              </CardTitle>
            </CardHeader>
            <CardContent style={{ height: 220 }}>
              <ResponsiveContainer>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
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
        </div>
      </motion.div>

      {/* History */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-0 bg-white/90 backdrop-blur-md shadow-sm hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-indigo-700">
              Historique des rapports finaux
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Consulte et télécharge tes analyses complètes.
            </p>
          </CardHeader>
          <CardContent>
            {history.filter((r) => r.is_final).length === 0 ? (
              <p className="text-gray-500 italic text-sm">
                Aucun rapport final enregistré pour l’instant.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-100">
                <table className="min-w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-4 py-2 text-left font-semibold text-gray-600">
                        Date
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-600">
                        Emails analysés
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
                        (a, b) =>
                          new Date(b.created_at) - new Date(a.created_at)
                      )
                      .map((r) => (
                        <tr
                          key={r.id}
                          className="border-b hover:bg-indigo-50/40 transition-all"
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
                          <td className="px-4 py-2 text-gray-700 text-center">
                            {r.total_emails || 0}
                          </td>
                          <td className="px-4 py-2 text-gray-600 max-w-xs truncate">
                            {r.report_text?.slice(0, 120) || "—"}
                          </td>
                          <td className="px-4 py-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                              onClick={() => downloadReportPdf(r)}
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

      {/* Purchase CTA */}
      <div className="bg-gradient-to-r from-indigo-50 via-pink-50 to-indigo-50 border border-indigo-100 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Zap className="text-indigo-600" size={18} />
            Booster de crédits
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Il te reste{" "}
            <span className="font-semibold text-indigo-700">
              {Number(localCredits ?? credits ?? 0)}
            </span>{" "}
            crédits. Recharge maintenant pour analyser plus d'emails sans
            attendre.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => navigate("/billing")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-xl flex items-center gap-2"
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

      {/* Footer error */}
      {error && (
        <Alert className="mt-4 bg-red-50 border border-red-200 text-red-600">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  </div>
);
}