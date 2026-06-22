import { useNavigate } from "react-router-dom"

const fmtDate = (val) => {
  if (!val) return "—"
  const d = new Date(val)
  if (isNaN(d)) return "—"
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}

const fmtTimestamp = (val) => {
  if (!val) return "—"
  const d = new Date(val)
  if (isNaN(d)) return "—"
  let h = d.getHours(), m = String(d.getMinutes()).padStart(2, "0")
  const ampm = h >= 12 ? "PM" : "AM"
  h = h % 12 || 12
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(h).padStart(2, "0")}:${m} ${ampm}`
}

const STATUS_COLORS = {
  Active:    { bg: "#F0FDF4", color: "#15803D" },
  Inactive:  { bg: "#FEF2F2", color: "#DC2626" },
  Prospect:  { bg: "#FFFBEB", color: "#B45309" },
  Approved:  { bg: "#EFF6FF", color: "#1D4ED8" },
  Pending:   { bg: "#FFF7ED", color: "#C2410C" },
  Rejected:  { bg: "#FFF1F2", color: "#9F1239" },
}

export default function ClientRow({ item }) {
  const navigate = useNavigate()
  const sm = STATUS_COLORS[item.companyStatus] || { bg: "#F3F4F6", color: "#374151" }

  return (
    <tr
      style={{ background: "#fff", borderBottom: "1px solid #F3F4F6", cursor: "default" }}
      onMouseEnter={e => e.currentTarget.style.background = "#FAFAFF"}
      onMouseLeave={e => e.currentTarget.style.background = "#fff"}
    >
      <td style={td}>{fmtTimestamp(item.created_at)}</td>
      <td style={{ ...td, fontWeight: 500, color: "#1F2937", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis" }}>
        {item.companyName || "—"}
      </td>
      <td style={td}>{item.bdMemberName || "—"}</td>
      <td style={td}>{item.contactPersonName || "—"}</td>
      <td style={td}>{item.phoneNumber || "—"}</td>
      <td style={td}>{item.emailId || "—"}</td>
      <td style={td}>{item.city || "—"}</td>
      <td style={td}>{item.industry || "—"}</td>
      <td style={td}>
        <span style={{ background: sm.bg, color: sm.color, padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 500, whiteSpace: "nowrap" }}>
          {item.companyStatus || "—"}
        </span>
      </td>
      <td style={td}>{item.approvalStatus || "—"}</td>
      <td style={td}>{item.teamLeader || "—"}</td>
      <td style={td}>{item.franchiseeName || "—"}</td>
      <td style={td}>{fmtDate(item.dateOfClientAllocation)}</td>
      <td style={td}>
        <button
          onClick={() => navigate(`/edit-client/${item.id}`)}
          style={{ background: "#F5F3FF", color: "#5B21B6", border: "1px solid #DDD6FE", borderRadius: 6, padding: "4px 14px", cursor: "pointer", fontSize: 12, fontWeight: 500 }}
        >
          Edit
        </button>
      </td>
    </tr>
  )
}

const td = { padding: "12px 14px", fontSize: 13, color: "#374151", whiteSpace: "nowrap" }