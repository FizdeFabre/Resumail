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

const PIE_COLORS = ["#7C3AED","#EF4444", "#F472B6",  "#7E9444"]; 
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
    { name: "Positive", value: stats?.avg?.positive ?? 0 },
    { name: "Neutral", value: stats?.avg?.neutral ?? 0 },
    { name: "Negative", value: stats?.avg?.negative ?? 0 },
    { name: "Other", value: stats?.avg?.other ?? 0 },
  ];

// --- Partie visuelle revue uniquement ---
// ✅ Aucun changement fonctionnel (toutes les redirections, hooks, etc. inchangés)

if (loading)
  return (
    <div className="p-6 text-center text-gray-500 animate-pulse">
      Loading data ... 
    </div>
  );

if (!user)
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl text-center shadow-lg border border-white/20">
        <h2 className="text-2xl font-semibold text-white mb-4">Login requiered </h2>
        <p className="text-white/80 mb-6">
          Login with Resumail
        </p>
        <Button
          onClick={() => navigate("/login")}
          className="bg-white text-indigo-700 hover:bg-gray-100"
        >
         Login
        </Button>
      </div>
    </div>
  );

    console.log("📊 Stats data:", stats);

return (
  <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500">
    {/* Header */}
    <header className="sticky top-0 z-30 bg-white/10 bg-indigo-500 border-b border-white/20">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">
            Welcome, <span className="text-white/80">{user.email}</span>
          </h1>
          <p className="text-white/70 text-sm">Summary & history — Resumail</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm">
            Credits:&nbsp; <span className="font-semibold">{Number(localCredits ?? credits ?? 0)}</span>
          </div>
          <Button
            variant="outline"
            onClick={async () => { await supabase.auth.signOut(); navigate("/"); }}
            className="bg-white/10 hover:bg-white/20 text-white border-white/30"
          >
            Logout
          </Button>
          <Button onClick={() => navigate("/billing")} className="bg-white text-indigo-700 hover:bg-gray-100">
            Add credits
          </Button>
        </div>
      </div>
    </header>

    {/* Banner / Dev message */}
    <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 backdrop-blur border border-red/60 shadow-md mt-6 mx-6">
      <div className="p-6">
        <h3 className="text-white font-semibold text-lg">Heads up!</h3>
        <p className="text-white/80 text-sm mt-2">
          Resumail is still under development — if you encounter any bug or have a suggestion, feel free to reach out:
        </p>
        <p className="text-white font-semibold mt-2">
          📧 resumail.saas@gmail.com
        </p>
      </div>
    </div>

    {/* Body */}
    <main className="max-w-7xl mx-auto px-6 py-8">

      {/* Gmail connection card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="mb-8"
      >
        <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-white text-lg font-semibold">Gmail Connection</h2>
                <p className="text-white/80 text-sm">
                  Connect your Gmail account to enable filters and generate reports.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => (window.location.href = `${API_BASE}/auth/google`)}
                  className="bg-white text-indigo-700 hover:bg-gray-100"
                >
                  Connect Gmail
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/filters")}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/30"
                >
                  Go to Filters
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats & Charts */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
      >
        {/* Total emails */}
        <div className="rounded-2xl bg-white/90 backdrop-blur border border-white/60 shadow-md">
          <div className="p-6">
            <h3 className="text-gray-900 font-semibold">Total Emails Analyzed</h3>
            <div className="text-4xl font-extrabold text-indigo-700 mt-2">
              {stats?.total_emails ?? 0}
            </div>
            <p className="text-gray-500 text-sm mt-4">Last summary:</p>
            <p className="text-gray-800 text-sm mt-1 line-clamp-4 break-words">
              {stats?.last_summary ?? "—"}
            </p>
          </div>
        </div>

        {/* Pie Chart */}
      <div className="rounded-2xl bg-white/90 backdrop-blur border border-white/60 shadow-md">
  <div className="p-6">
    <h3 className="text-gray-900 font-semibold">Sentiment Distribution</h3>
    {pieData.every(d => d.value === 0) ? (
      <p className="text-gray-500 text-sm mt-3 italic">
        No sentiment data available yet.
      </p>
    ) : (
      <div style={{ height: 220 }} className="mt-3">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={82}
              paddingAngle={4}
            >
              {pieData.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => `${v}`} />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    )}
  </div>
</div>


        {/* Line Chart */}
        <div className="rounded-2xl bg-white/90 backdrop-blur border border-white/60 shadow-md">
          <div className="p-6">
            <h3 className="text-gray-900 font-semibold">Trend — Processed Emails</h3>
            <div style={{ height: 220 }} className="mt-3">
              <ResponsiveContainer>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="emails" stroke="#7C3AED" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Reports history */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="rounded-2xl bg-white/90 backdrop-blur border border-white/60 shadow-md">
          <div className="p-6 md:p-8">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900">Final Reports History</h3>
              <p className="text-sm text-gray-500">View and download your complete analyses.</p>
            </div>

            {history.filter((r) => r.is_final).length === 0 ? (
              <p className="text-gray-500 italic text-sm">No final report available yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-gray-600">Date</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-600">Emails</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-600">Summary</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {history
                      .filter((r) => r.is_final)
                      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                      .map((r) => (
                        <tr key={r.id} className="hover:bg-gray-50/70">
                          <td className="px-4 py-2 text-gray-700">
                            {new Date(r.created_at).toLocaleString("en-US", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="px-4 py-2 text-gray-700">{r.total_emails || 0}</td>
                          <td className="px-4 py-2 text-gray-600 max-w-xs truncate">{r.report_text?.slice(0, 140) || "—"}</td>
                          <td className="px-4 py-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                              onClick={() => downloadReportPdf(r)}
                            >
                              Download PDF
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Credit Booster CTA */}
      <div className="mt-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 flex flex-col md:flex-row items-center justify-between gap-4 text-white shadow-2xl">
        <div>
          <h4 className="text-lg font-semibold">Credit Booster</h4>
          <p className="text-white/80 text-sm mt-1">
            You have <span className="font-semibold">{Number(localCredits ?? credits ?? 0)}</span> credits left.
            Add more to analyze additional emails.
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => navigate("/billing")} className="bg-white text-indigo-700 hover:bg-gray-100">
            Add credits
          </Button>
          <Button
            variant="outline"
            onClick={() => updateCredits && updateCredits(user.id, 100)}
            className="bg-white/10 hover:bg-white/20 text-white border-white/30"
          >
            +100 (test)
          </Button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3">
          {error}
        </div>
      )}
    </main>
  </div>
);


}