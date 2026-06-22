import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getClients } from "../services/clientService"
import ClientTable from "../components/ClientTable"
import axios from "axios"

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"

export default function Dashboard() {
  const navigate = useNavigate()
  const [data, setData]                       = useState([])
  const [loading, setLoading]                 = useState(true)
  const [sheetMsg, setSheetMsg]               = useState("")
  const [googleConnected, setGoogleConnected] = useState(false)
  const [sheetUrl, setSheetUrl]               = useState(null)

  const load = async () => {
    try {
      const res = await getClients()
      setData(res.data.data || [])
    } catch (err) {
      console.error("Failed to load clients:", err.message)
    } finally {
      setLoading(false)
    }
  }

  const checkGoogleStatus = async () => {
    try {
      const res = await axios.get(`${BACKEND}/auth/google/status`)
      const { connected, currentSheetId } = res.data || {}
      if (connected && currentSheetId) {
        setGoogleConnected(true)
        setSheetUrl(`https://docs.google.com/spreadsheets/d/${currentSheetId}/edit`)
      } else {
        setGoogleConnected(false)
        setSheetUrl(null)
      }
    } catch {
      setGoogleConnected(false)
      setSheetUrl(null)
    }
  }

  useEffect(() => {
    load()

    // ✅ First check URL params BEFORE checking google status
    const params = new URLSearchParams(window.location.search)

    if (params.get("google") === "connected") {
      const sid = params.get("sheetId")
      if (sid) {
        setSheetUrl(`https://docs.google.com/spreadsheets/d/${sid}/edit`)
        setGoogleConnected(true)
      }
      setSheetMsg("✅ Google Sheet created and live sync started!")
      setTimeout(() => setSheetMsg(""), 5000)
      window.history.replaceState({}, "", window.location.pathname)
    } else if (params.get("google") === "denied") {
      const deniedEmail = params.get("email") || "your account"
      setGoogleConnected(false)
      setSheetUrl(null)
      setSheetMsg(`🚫 Access denied for ${decodeURIComponent(deniedEmail)}. You are not authorized to connect Google Sheets.`)
      setTimeout(() => setSheetMsg(""), 8000)
      window.history.replaceState({}, "", window.location.pathname)
    } else if (params.get("google") === "error") {
      setGoogleConnected(false)
      setSheetUrl(null)
      setSheetMsg("❌ Google auth failed. Please try connecting again.")
      setTimeout(() => setSheetMsg(""), 6000)
      window.history.replaceState({}, "", window.location.pathname)
    } else {
      // No URL params — check actual status from backend
      checkGoogleStatus()
    }

    const interval = setInterval(() => {
      load()
      checkGoogleStatus()
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  const handleSheetClick = () => {
    if (googleConnected && sheetUrl) {
      window.open(sheetUrl, "_blank")
    } else {
      window.location.href = `${BACKEND}/auth/google`
    }
  }

  const total    = data.length
  const active   = data.filter(d => d.companyStatus === "Active").length
  const approved = data.filter(d => d.approvalStatus === "Approved").length
  const inactive = data.filter(d => d.companyStatus === "Inactive").length

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#F9FAFB" }}>
      <p style={{ color: "#6B7280", fontFamily: "sans-serif", fontWeight: 500 }}>Loading...</p>
    </div>
  )

  return (
    <div style={{ minHeight: "100vh", background: "#F5F3FF", fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Top Navbar */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E9D5FF", padding: "14px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: "#5B21B6",
            color: "#fff", fontWeight: 700, fontSize: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>S</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#5B21B6" }}>Saarthi360</h1>
            <p style={{ margin: 0, fontSize: 11, color: "#9CA3AF" }}>Client Management Dashboard</p>
          </div>
        </div>

        <button onClick={handleSheetClick} style={googleConnected && sheetUrl ? greenBtn : connectBtn}>
          {googleConnected && sheetUrl ? (
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" rx="3" fill="white" fillOpacity="0.2"/>
                <rect x="6" y="7" width="5" height="2" rx="0.5" fill="white"/>
                <rect x="13" y="7" width="5" height="2" rx="0.5" fill="white"/>
                <rect x="6" y="11" width="5" height="2" rx="0.5" fill="white"/>
                <rect x="13" y="11" width="5" height="2" rx="0.5" fill="white"/>
                <rect x="6" y="15" width="5" height="2" rx="0.5" fill="white"/>
                <rect x="13" y="15" width="5" height="2" rx="0.5" fill="white"/>
              </svg>
              Open Google Sheet
            </span>
          ) : "🔗 Connect Google Account"}
        </button>
      </div>

      {/* Banner */}
      {sheetMsg && (
        <div style={{
          margin: "12px 28px 0", padding: "10px 16px",
          background: sheetMsg.startsWith("✅") ? "#F0FDF4" : "#FEF2F2",
          border: `1px solid ${sheetMsg.startsWith("✅") ? "#BBF7D0" : "#FECACA"}`,
          borderRadius: 8,
          color: sheetMsg.startsWith("✅") ? "#15803D" : "#DC2626",
          fontSize: 13, fontWeight: 500,
        }}>
          {sheetMsg}
        </div>
      )}

      <div style={{ padding: "24px 28px" }}>

        {/* Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Total Clients", value: total,    color: "#5B21B6" },
            { label: "Active",        value: active,   color: "#15803D" },
            { label: "Approved",      value: approved, color: "#0369A1" },
            { label: "Inactive",      value: inactive, color: "#DC2626" },
          ].map(s => (
            <div key={s.label} style={{ background: "#fff", border: "1px solid #E9D5FF", borderRadius: 12, padding: "18px 20px" }}>
              <p style={{ margin: "0 0 6px", fontSize: 12, color: "#6B7280", fontWeight: 500 }}>{s.label}</p>
              <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Client Table */}
        <div style={{ background: "#fff", border: "1px solid #E9D5FF", borderRadius: 12, padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#5B21B6" }}>
                Client Data ({data.length.toLocaleString()})
              </h2>
              <p style={{ margin: 0, fontSize: 13, color: "#6B7280" }}>All client data is listed here</p>
            </div>
          </div>
          <ClientTable clients={data} refreshData={load} onAddClick={() => navigate("/add-client")} />
        </div>
      </div>

    </div>
  )
}

const greenBtn   = { display: "flex", alignItems: "center", gap: 8, background: "#107c41", color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", cursor: "pointer", fontSize: 13, fontWeight: 600 }
const connectBtn = { background: "#5B21B6", color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", cursor: "pointer", fontSize: 13, fontWeight: 600 }