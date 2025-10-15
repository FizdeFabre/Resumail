import React, { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
// import { Button } from "@/components/ui/button"

export default function Analyse() {
  const location = useLocation()
  const { emails = [] } = location.state || {}
  const [batches, setBatches] = useState([])
  const [reports, setReports] = useState([])
  const [finalReport, setFinalReport] = useState(null)
  const [loading, setLoading] = useState(false)

  // Découpe les emails en batchs de 5
  function chunkArray(array, size) {
    const res = []
    for (let i = 0; i < array.length; i += size) {
      res.push(array.slice(i, i + size))
    }
    return res
  }

  useEffect(() => {
    if (emails.length > 0) {
      setBatches(chunkArray(emails, 5)) // 5 emails par batch (modifiable)
    }
  }, [emails])

  async function analyzeBatches() {
    setLoading(true)
    setReports([])
    setFinalReport(null)

    try {
      const newReports = []
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i]
        // 🔥 Appel backend IA : à brancher sur ton endpoint
        const res =await fetch("http://localhost:3000/analyze/v2", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ userId, emails: batch }),
});
        const data = await res.json()
        newReports.push(data.report || `Batch ${i + 1}: aucun résultat`)
      }

      setReports(newReports)

      // Fusionner les mini-rapports en un seul gros
      const resFinal = await fetch("http://localhost:3000/analyze/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reports: newReports }),
      })
      const merged = await resFinal.json()
      setFinalReport(merged.report || "Fusion échouée")
    } catch (err) {
      console.error("Erreur analyse IA:", err)
    } finally {
      setLoading(false)
    }
  }

  if (!emails.length) {
    return <p className="p-6">⚠️ Aucun email reçu depuis Filters.jsx</p>
  }

  return (
    <div className="p-6 max-w-5xl mx-auto font-sans">
      <h1 className="text-2xl font-bold mb-4">Analyse IA</h1>
      <p className="mb-4 text-gray-600">
        {emails.length} emails sélectionnés, regroupés en {batches.length} batchs.
      </p>

      <Button onClick={analyzeBatches} disabled={loading}>
        {loading ? "Analyse en cours..." : "Lancer l'analyse"}
      </Button>

      {/* Résultats batchs */}
      {reports.length > 0 && (
        <div className="mt-6 space-y-4">
          <h2 className="text-xl font-semibold">Résultats par batch</h2>
          {reports.map((r, i) => (
            <div key={i} className="p-3 border rounded bg-gray-50">
              <strong>Batch {i + 1} :</strong>
              <pre className="whitespace-pre-wrap text-sm">{r}</pre>
            </div>
          ))}
        </div>
      )}

      {/* Rapport final */}
      {finalReport && (
        <div className="mt-8 p-4 border rounded bg-green-50">
          <h2 className="text-xl font-bold mb-2">Rapport final consolidé</h2>
          <pre className="whitespace-pre-wrap">{finalReport}</pre>
        </div>
      )}
    </div>
  )
}