import { useEffect, useState } from "react"
import { getEnquiries } from "../services/enquiryService"
import EnquiryTable from "../components/EnquiryTable"
import AddEnquiryModal from "../components/AddEnquiryModal"
import axios from "axios"

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"

export default function Dashboard() {
  const [data, setData]                       = useState([])
  const [loading, setLoading]                 = useState(true)
  const [showAdd, setShowAdd]                 = useState(false)
  const [sheetMsg, setSheetMsg]               = useState("")
  const [googleConnected, setGoogleConnected] = useState(false)
  const [sheetUrl, setSheetUrl]               = useState(null) // store full URL directly

  const load = async () => {
    try {
      const res = await getEnquiries()
      setData(res.data.data || [])
    } catch (err) {
      console.error("Failed to load enquiries:", err.message)
    } finally {
      setLoading(false)
    }
  }

  const checkGoogleStatus = async () => {
    try {
      const res = await axios.get(`${BACKEND}/auth/google/status`)
      const { connected, currentSheetId } = res.data || {}
      setGoogleConnected(!!connected)
      if (currentSheetId) {
        setSheetUrl(`https://docs.google.com/spreadsheets/d/${currentSheetId}/edit`)
      }
    } catch {
      setGoogleConnected(false)
    }
  }

  useEffect(() => {
    load()
    checkGoogleStatus()

    const interval = setInterval(() => {
      load()
      checkGoogleStatus()
    }, 60000)

    const params = new URLSearchParams(window.location.search)

    if (params.get("google") === "connected") {
      const sid = params.get("sheetId")
      if (sid) setSheetUrl(`https://docs.google.com/spreadsheets/d/${sid}/edit`)
      setGoogleConnected(true)
      setSheetMsg("✅ Google Sheet created and live sync started!")
      setTimeout(() => setSheetMsg(""), 5000)
      window.history.replaceState({}, "", window.location.pathname)
    }

    if (params.get("google") === "error") {
      setSheetMsg("ℹ️ Google auth failed. Please try connecting again.")
      setTimeout(() => setSheetMsg(""), 6000)
      window.history.replaceState({}, "", window.location.pathname)
    }

    return () => clearInterval(interval)
  }, [])

  const handleOpenSheet = () => {
    if (googleConnected) {
      // directly open — no async, no API call, no chance of silent failure
      const url = sheetUrl || "https://drive.google.com/drive/my-drive"
      window.open(url, "_blank")
    } else {
      setSheetMsg("⏳ Contacting Google...")
      window.location.href = `${BACKEND}/auth/google`
    }
  }

  const total    = data.length
  const closed   = data.filter(d => d.enquiryStatus === "closed").length
  const invoiced = data.filter(d => d.enquiryStatus === "invoiced").length
  const totalAmt = data.reduce((s, d) => s + (parseFloat(d.bill_amount) || 0), 0)

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:"#F9FAFB" }}>
      <p style={{ color:"#6B7280", fontFamily:"sans-serif", fontWeight:500 }}>Loading...</p>
    </div>
  )

  return (
    <div style={{ minHeight:"100vh", background:"#F5F3FF", fontFamily:"'Segoe UI', sans-serif" }}>

      {/* Top Navbar */}
      <div style={{ background:"#fff", borderBottom:"1px solid #E9D5FF", padding:"14px 28px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <h1 style={{ margin:0, fontSize:20, fontWeight:700, color:"#5B21B6" }}>Saarthi360</h1>
          <p style={{ margin:0, fontSize:11, color:"#9CA3AF" }}>Enquiry Management Dashboard</p>
        </div>
        <button onClick={() => window.open(`${BACKEND}/api/enquiries/export/excel`)} style={excelBtn}>
          ⬇ Excel Backup View
        </button>
      </div>

      {sheetMsg && (
        <div style={{
          margin:"12px 28px 0", padding:"10px 16px",
          background: sheetMsg.startsWith("✅") ? "#F0FDF4" : (sheetMsg.startsWith("ℹ️") ? "#EFF6FF" : "#FFF1F2"),
          border: `1px solid ${sheetMsg.startsWith("✅") ? "#BBF7D0" : (sheetMsg.startsWith("ℹ️") ? "#BFDBFE" : "#FECACA")}`,
          borderRadius:8,
          color: sheetMsg.startsWith("✅") ? "#15803D" : (sheetMsg.startsWith("ℹ️") ? "#1E40AF" : "#BE123C"),
          fontSize:13, fontWeight:500
        }}>
          {sheetMsg}
        </div>
      )}

      <div style={{ padding:"24px 28px" }}>

        {/* Stat Cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:16, marginBottom:24 }}>
          {[
            { label:"Total Enquiries", value:total,    color:"#5B21B6" },
            { label:"Closed",          value:closed,   color:"#15803D" },
            { label:"Invoiced",        value:invoiced, color:"#0369A1" },
            { label:"Total Amount",    value:`₹${totalAmt.toLocaleString("en-IN")}`, color:"#B45309" },
          ].map(s => (
            <div key={s.label} style={{ background:"#fff", border:"1px solid #E9D5FF", borderRadius:12, padding:"18px 20px" }}>
              <p style={{ margin:"0 0 6px", fontSize:12, color:"#6B7280", fontWeight:500 }}>{s.label}</p>
              <p style={{ margin:0, fontSize:24, fontWeight:700, color:s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        <div style={{ background:"#fff", border:"1px solid #E9D5FF", borderRadius:12, padding:"20px 24px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
            <div>
              <h2 style={{ margin:"0 0 4px", fontSize:22, fontWeight:700, color:"#5B21B6" }}>
                Enquiry Data ({data.length.toLocaleString()})
              </h2>
              <p style={{ margin:0, fontSize:13, color:"#6B7280" }}>All the enquiry data are listed here</p>
            </div>

            <button onClick={handleOpenSheet} style={googleConnected ? greenBtn : connectBtn}>
              {googleConnected ? (
                <>
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
                </>
              ) : "🔗 Connect Google Account"}
            </button>
          </div>

          <EnquiryTable enquiries={data} refreshData={load} onAddClick={() => setShowAdd(true)} />
        </div>
      </div>

      {showAdd && <AddEnquiryModal onClose={() => setShowAdd(false)} refreshData={load} />}
    </div>
  )
}

const greenBtn   = { display:"flex", alignItems:"center", gap:8, background:"#107c41", color:"#fff", border:"none", borderRadius:8, padding:"9px 18px", cursor:"pointer", fontSize:13, fontWeight:600 }
const connectBtn = { background:"#5B21B6", color:"#fff", border:"none", borderRadius:8, padding:"9px 18px", cursor:"pointer", fontSize:13, fontWeight:600 }
const excelBtn   = { background:"#fff", color:"#374151", border:"1px solid #D1D5DB", borderRadius:8, padding:"9px 18px", cursor:"pointer", fontSize:13, fontWeight:500 }
