// src/components/ReportsHistory.jsx
import React, { useEffect, useState } from "react";
import { getUserId } from "../utils/auth"; // adapte selon ton projet

export default function ReportsHistory() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      try {
        const userId = await getUserId();
        if (!userId) throw new Error("Utilisateur non connecté");

        const res = await fetch(`http://localhost:3000/reports/user/${userId}`);
        if (!res.ok) throw new Error("Erreur lors du chargement des rapports");
        const data = await res.json();
        setReports(data);
      } catch (err) {
        console.error("Erreur de chargement des rapports:", err);
        alert(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  if (loading) return <p>Chargement des rapports...</p>;
  if (!reports.length) return <p>Aucun rapport trouvé.</p>;

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">🕮 Historique des rapports</h2>
      {reports.map((r) => (
        <div key={r.id} className="bg-white rounded-2xl shadow p-4 flex justify-between items-center hover:bg-gray-50 transition">
          <div>
            <p className="text-lg font-semibold text-gray-800">Rapport #{r.id.slice(0, 6)}</p>
            <p className="text-sm text-gray-500">
              {new Date(r.created_at).toLocaleString()} — {r.total_emails ?? 0} emails
            </p>
            <p className="text-sm mt-2 text-gray-700 line-clamp-2">
              {r.summary || r.report_text || "Aucun résumé"}
            </p>
          </div>
          <a
            href={`http://localhost:3000/reports/${r.id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
          >
            Télécharger PDF
          </a>
        </div>
      ))}
    </div>
  );
}