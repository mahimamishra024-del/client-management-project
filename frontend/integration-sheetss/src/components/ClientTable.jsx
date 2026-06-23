import { useState, useMemo } from "react"
import ClientRow from "./ClientRow"

export default function ClientTable({ clients, refreshData, onAddClick }) {
  const [search, setSearch]           = useState("")
  const [statusFilter, setStatus]     = useState("")
  const [cityFilter, setCity]         = useState("")
  const [industryFilter, setIndustry] = useState("")
  const [sortBy, setSortBy]           = useState("")
  const [sortValue, setSortValue]     = useState("")

  const uniqueCities      = useMemo(() => [...new Set(clients.map(c => c.city).filter(Boolean))].sort(),          [clients])
  const uniqueIndustries  = useMemo(() => [...new Set(clients.map(c => c.industry).filter(Boolean))].sort(),      [clients])
  const uniqueStatuses    = useMemo(() => [...new Set(clients.map(c => c.companyStatus).filter(Boolean))].sort(), [clients])
  const uniqueFranchisees = useMemo(() => [...new Set(clients.map(c => c.franchiseeName).filter(Boolean))].sort(),[clients])
  const uniqueBDMembers   = useMemo(() => [...new Set(clients.map(c => c.bdMemberName).filter(Boolean))].sort(),  [clients])
  const uniqueTeamLeaders = useMemo(() => [...new Set(clients.map(c => c.teamLeader).filter(Boolean))].sort(),    [clients])

  const filtered = useMemo(() => {
    let d = [...clients]

    if (search) {
      const q = search.toLowerCase()
      d = d.filter(r =>
        (r.companyName        || "").toLowerCase().includes(q) ||
        (r.contactPersonName  || "").toLowerCase().includes(q) ||
        (r.emailId            || "").toLowerCase().includes(q) ||
        (r.phoneNumber        || "").includes(q) ||
        (r.city               || "").toLowerCase().includes(q) ||
        (r.industry           || "").toLowerCase().includes(q)
      )
    }

    if (sortBy && sortValue) d = d.filter(r => (r[sortBy] || "") === sortValue)
    if (cityFilter)          d = d.filter(r => r.city          === cityFilter)
    if (industryFilter)      d = d.filter(r => r.industry      === industryFilter)
    if (statusFilter)        d = d.filter(r => r.companyStatus === statusFilter)

    d.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    return d
  }, [clients, search, statusFilter, cityFilter, industryFilter, sortBy, sortValue])

  return (
    <div>

      {/* ── Row 1: Search + Sort by ── */}
      <div style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#6B7280" }}>🔍</span>
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...plainInput, paddingLeft: 34 }}
          />
        </div>

        <select value={sortBy} onChange={e => { setSortBy(e.target.value); setSortValue("") }} style={{ ...plainSelect, minWidth: 150 }}>
          <option value="">Sort by: None</option>
          <option value="franchiseeName">Franchisee Name</option>
          <option value="bdMemberName">BD Member</option>
          <option value="teamLeader">Team Leader</option>
        </select>

        {sortBy && (
          <select value={sortValue} onChange={e => setSortValue(e.target.value)} style={{ ...plainSelect, minWidth: 150 }}>
            <option value="">Select Value</option>
            {sortBy === "franchiseeName" && uniqueFranchisees.map(n => <option key={n} value={n}>{n}</option>)}
            {sortBy === "bdMemberName"   && uniqueBDMembers.map(n   => <option key={n} value={n}>{n}</option>)}
            {sortBy === "teamLeader"     && uniqueTeamLeaders.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        )}
      </div>

      {/* ── Row 2: City + Industry + Status ── */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <select value={cityFilter} onChange={e => setCity(e.target.value)} style={{ ...plainSelect, flex: 1 }}>
          <option value="">Filter by: City</option>
          {uniqueCities.map(n => <option key={n} value={n}>{n}</option>)}
        </select>

        <select value={industryFilter} onChange={e => setIndustry(e.target.value)} style={{ ...plainSelect, flex: 1 }}>
          <option value="">Filter by: Industry</option>
          {uniqueIndustries.map(n => <option key={n} value={n}>{n}</option>)}
        </select>

        <select value={statusFilter} onChange={e => setStatus(e.target.value)} style={{ ...plainSelect, flex: 1 }}>
          <option value="">Filter by: Status</option>
          {uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* ── Add Button ── */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={onAddClick} style={{ background: "#5B21B6", color: "#fff", border: "none", padding: "11px 24px", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
          + Add Client
        </button>
      </div>

      {/* ── Summary ── */}
      <div style={{ marginBottom: 14, padding: "10px 4px" }}>
        <span style={{ fontSize: 14, color: "#1F2937" }}>
          <strong>Client Data ({filtered.length.toLocaleString()})</strong>
        </span>
      </div>

      {/* ── Table ── */}
      <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #E5E7EB" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1600 }}>
          <thead>
            <tr style={{ background: "#F9FAFB" }}>
              {[
                "TIMESTAMP", "COMPANY NAME", "BD MEMBER", "CONTACT PERSON",
                "PHONE", "EMAIL", "CITY", "INDUSTRY",
                "COMPANY STATUS", "APPROVAL STATUS", "TEAM LEADER",
                "FRANCHISEE", "DATE OF ALLOCATION", "BILLING STATUS", "BILL NO", "BILL AMOUNT", "ACTION"
              ].map(h => (
                <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#4B5563", borderBottom: "1px solid #E5E7EB", whiteSpace: "nowrap", letterSpacing: "0.04em" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={17} style={{ padding: 40, textAlign: "center", color: "#9CA3AF", fontSize: 14 }}>No matching records</td></tr>
            ) : (
              filtered.map(item => <ClientRow key={item.id} item={item} refreshData={refreshData} />)
            )}
          </tbody>
        </table>
      </div>

    </div>
  )
}

const plainInput = {
  width: "100%", boxSizing: "border-box", padding: "9px 12px",
  border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 13,
  background: "#fff", color: "#1F2937", outline: "none",
}

const plainSelect = {
  padding: "9px 12px", border: "1px solid #D1D5DB", borderRadius: 8,
  fontSize: 13, background: "#fff", color: "#374151",
  cursor: "pointer", outline: "none",
}