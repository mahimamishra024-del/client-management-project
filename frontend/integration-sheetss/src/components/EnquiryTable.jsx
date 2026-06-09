import { useState, useMemo } from "react"
import EnquiryRow from "./EnquiryRow"

const FINANCIAL_MONTH_OPTIONS = [
  { name: "April",     index: 4  }, { name: "May",      index: 5  },
  { name: "June",      index: 6  }, { name: "July",     index: 7  },
  { name: "August",    index: 8  }, { name: "September",index: 9  },
  { name: "October",   index: 10 }, { name: "November", index: 11 },
  { name: "December",  index: 12 }, { name: "January",  index: 1  },
  { name: "February",  index: 2  }, { name: "March",    index: 3  },
]

const FINANCIAL_YEARS = ["2022-2023", "2023-2024", "2024-2025", "2025-2026"]

export default function EnquiryTable({ enquiries, refreshData, onAddClick }) {
  const [search, setSearch]         = useState("")
  const [statusFilter, setStatus]   = useState("")
  const [companyFilter, setCompany] = useState("")
  const [designFilter, setDesign]   = useState("")
  const [sortBy, setSortBy]         = useState("")
  const [sortValue, setSortValue]   = useState("")
  const [timeType, setTimeType]     = useState("all")
  const [timeValue, setTimeValue]   = useState("all")
  const [timeMonth, setTimeMonth]   = useState("all")

  const uniqueCompanies   = useMemo(() => [...new Set(enquiries.map(e => e.companyName).filter(Boolean))].sort(),     [enquiries])
  const uniqueDesigs      = useMemo(() => [...new Set(enquiries.map(e => e.designation).filter(Boolean))].sort(),    [enquiries])
  const uniqueStatuses    = useMemo(() => [...new Set(enquiries.map(e => e.enquiryStatus).filter(Boolean))].sort(),  [enquiries])
  const uniqueFranchisees = useMemo(() => [...new Set(enquiries.map(e => e.franchiseeName).filter(Boolean))].sort(), [enquiries])
  const uniqueBDMembers   = useMemo(() => [...new Set(enquiries.map(e => e.bdMemberName).filter(Boolean))].sort(),   [enquiries])
  const uniqueTeamLeaders = useMemo(() => [...new Set(enquiries.map(e => e.teamLeaderName).filter(Boolean))].sort(), [enquiries])

  const filtered = useMemo(() => {
    let d = [...enquiries]

    if (timeType !== "all" && timeValue !== "all") {
      d = d.filter(item => {
        const dateStr = item.dateOfAllocation || item.created_at
        if (!dateStr) return false
        const dt = new Date(dateStr)
        if (isNaN(dt)) return false
        const month = dt.getMonth() + 1
        if (timeType === "year") {
          const [startY, endY] = timeValue.split("-").map(Number)
          const inRange = dt >= new Date(startY, 3, 1) && dt <= new Date(endY, 2, 31, 23, 59, 59)
          if (!inRange) return false
          if (timeMonth !== "all" && month !== parseInt(timeMonth)) return false
        }
        if (timeType === "month"   && month !== parseInt(timeValue)) return false
        if (timeType === "quarter") {
          const qMap = { Q1:[4,5,6], Q2:[7,8,9], Q3:[10,11,12], Q4:[1,2,3] }
          if (!qMap[timeValue]?.includes(month)) return false
        }
        return true
      })
    }

    if (search) {
      const q = search.toLowerCase()
      d = d.filter(r =>
        (r.companyName    || "").toLowerCase().includes(q) ||
        (r.emailId        || "").toLowerCase().includes(q) ||
        (r.mobileNo       || "").includes(q) ||
        (r.franchiseeName || "").toLowerCase().includes(q) ||
        (r.candidateName  || "").toLowerCase().includes(q) ||
        (r.positionName   || "").toLowerCase().includes(q)
      )
    }

    if (sortBy && sortValue) d = d.filter(r => (r[sortBy] || "") === sortValue)
    if (companyFilter)       d = d.filter(r => r.companyName   === companyFilter)
    if (designFilter)        d = d.filter(r => r.designation   === designFilter)
    if (statusFilter)        d = d.filter(r => r.enquiryStatus === statusFilter)

    d.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    return d
  }, [enquiries, search, statusFilter, companyFilter, designFilter, sortBy, sortValue, timeType, timeValue, timeMonth])

  const totalAmt = filtered.reduce((s, r) => s + (parseFloat(r.bill_amount) || 0), 0)

  return (
    <div>

      {/* ── Row 1: Search + All Time + Sort by None ── */}
      <div style={{ display:"flex", gap:10, marginBottom:10, alignItems:"center", flexWrap:"wrap" }}>

        {/* Search — plain input */}
        <div style={{ position:"relative", flex:1, minWidth:240 }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:14, color:"#6B7280" }}>🔍</span>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...plainInput, paddingLeft:34 }}
          />
        </div>

        {/* All Time */}
        <select value={timeType} onChange={e => { setTimeType(e.target.value); setTimeValue("all"); setTimeMonth("all") }} style={plainSelect}>
          <option value="all">All Time</option>
          <option value="year">Yearly</option>
          <option value="month">Monthly</option>
          <option value="quarter">Quarterly</option>
        </select>

        {timeType === "year" && <>
          <select value={timeValue} onChange={e => setTimeValue(e.target.value)} style={plainSelect}>
            <option value="all">All Years</option>
            {FINANCIAL_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          {timeValue !== "all" && (
            <select value={timeMonth} onChange={e => setTimeMonth(e.target.value)} style={plainSelect}>
              <option value="all">All Months</option>
              {FINANCIAL_MONTH_OPTIONS.map(m => <option key={m.index} value={m.index}>{m.name}</option>)}
            </select>
          )}
        </>}

        {timeType === "month" && (
          <select value={timeValue} onChange={e => setTimeValue(e.target.value)} style={plainSelect}>
            <option value="all">All Months</option>
            {FINANCIAL_MONTH_OPTIONS.map(m => <option key={m.index} value={m.index}>{m.name}</option>)}
          </select>
        )}

        {timeType === "quarter" && (
          <select value={timeValue} onChange={e => setTimeValue(e.target.value)} style={plainSelect}>
            <option value="all">All Quarters</option>
            <option value="Q1">Q1 (Apr–Jun)</option>
            <option value="Q2">Q2 (Jul–Sep)</option>
            <option value="Q3">Q3 (Oct–Dec)</option>
            <option value="Q4">Q4 (Jan–Mar)</option>
          </select>
        )}

        {/* Sort by None */}
        <select value={sortBy} onChange={e => { setSortBy(e.target.value); setSortValue("") }} style={{ ...plainSelect, minWidth:150 }}>
          <option value="">Sort by: None</option>
          <option value="franchiseeName">Franchisee Name</option>
          <option value="bdMemberName">BD Member</option>
          <option value="teamLeaderName">Team Leader</option>
        </select>
        {sortBy && (
          <select value={sortValue} onChange={e => setSortValue(e.target.value)} style={{ ...plainSelect, minWidth:150 }}>
            <option value="">Select Value</option>
            {sortBy === "franchiseeName" && uniqueFranchisees.map(n => <option key={n} value={n}>{n}</option>)}
            {sortBy === "bdMemberName"   && uniqueBDMembers.map(n   => <option key={n} value={n}>{n}</option>)}
            {sortBy === "teamLeaderName" && uniqueTeamLeaders.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        )}
      </div>

      {/* ── Row 2: Company full width ── */}
      <div style={{ marginBottom:10 }}>
        <select value={companyFilter} onChange={e => setCompany(e.target.value)} style={{ ...plainSelect, width:"100%" }}>
          <option value="">Sort by: Company</option>
          {uniqueCompanies.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      {/* ── Row 3: Designation + Status ── */}
      <div style={{ display:"flex", gap:10, marginBottom:16 }}>
        <select value={designFilter} onChange={e => setDesign(e.target.value)} style={{ ...plainSelect, flex:1 }}>
          <option value="">Sort by: Designation</option>
          {uniqueDesigs.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatus(e.target.value)} style={{ ...plainSelect, flex:1 }}>
          <option value="">Sort by: Status</option>
          {uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* ── Add button ── */}
      <div style={{ marginBottom:20 }}>
        <button onClick={onAddClick} style={{ background:"#5B21B6", color:"#fff", border:"none", padding:"11px 24px", borderRadius:8, cursor:"pointer", fontSize:14, fontWeight:600 }}>
          + Add Enquiry Data
        </button>
      </div>

      {/* ── Summary bar ── */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14, padding:"10px 4px" }}>
        <span style={{ fontSize:14, color:"#1F2937" }}>
          <strong>Enquiry Data ({filtered.length.toLocaleString()})</strong>
          <span style={{ color:"#6B7280", marginLeft:8 }}>
            — Total Displayed Amount: "₹{totalAmt.toLocaleString("en-IN", { minimumFractionDigits:2 })}"
          </span>
        </span>

      </div>

      {/* ── Table ── */}
      <div style={{ overflowX:"auto", borderRadius:10, border:"1px solid #E5E7EB" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", minWidth:1200 }}>
          <thead>
            <tr style={{ background:"#F9FAFB" }}>
              {[
                "TIMESTAMP","COMPANY NAME","NAME OF FRANCHISEE","NAME OF CANDIDATE",
                "NAME OF HR EXECUTIVE","DESIGNATION","ENQUIRY STATUS",
                "REMARKS","MOBILE NO.","BILL NO","BILL DATE","BILL AMOUNT","ACTION"
              ].map(h => (
                <th key={h} style={{ padding:"11px 14px", textAlign:"left", fontSize:11, fontWeight:700, color:"#4B5563", borderBottom:"1px solid #E5E7EB", whiteSpace:"nowrap", letterSpacing:"0.04em" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={13} style={{ padding:40, textAlign:"center", color:"#9CA3AF", fontSize:14 }}>No matching records</td></tr>
            ) : (
              filtered.map(item => <EnquiryRow key={item.id} item={item} refreshData={refreshData} />)
            )}
          </tbody>
        </table>
      </div>

    </div>
  )
}

// Plain clean styles matching target UI
const plainInput = {
  width: "100%",
  boxSizing: "border-box",
  padding: "9px 12px",
  border: "1px solid #D1D5DB",
  borderRadius: 8,
  fontSize: 13,
  background: "#fff",
  color: "#1F2937",
  outline: "none",
}

const plainSelect = {
  padding: "9px 12px",
  border: "1px solid #D1D5DB",
  borderRadius: 8,
  fontSize: 13,
  background: "#fff",
  color: "#374151",
  cursor: "pointer",
  outline: "none",
}
