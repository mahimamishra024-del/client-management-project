import { useState } from "react"
import { createPortal } from "react-dom"
import EditEnquiryModal from "./EditEnquiryModal"

const STATUS_COLORS = {
  inprogress:           { bg:"#EFF6FF", color:"#1D4ED8" },
  closed:               { bg:"#F0FDF4", color:"#15803D" },
  invoiced:             { bg:"#E0F2FE", color:"#0369A1" },
  offered_and_accepted: { bg:"#F0FDF4", color:"#15803D" },
  offered_and_rejected: { bg:"#FFF1F2", color:"#BE123C" },
  position_hold:        { bg:"#FFFBEB", color:"#B45309" },
  internally_closed:    { bg:"#F5F3FF", color:"#6D28D9" },
  reallocation:         { bg:"#FFF7ED", color:"#C2410C" },
  revised:              { bg:"#F0F9FF", color:"#0369A1" },
  cancelled:            { bg:"#FEF2F2", color:"#DC2626" },
  rejected:             { bg:"#FFF1F2", color:"#9F1239" },
}

const STATUS_LABELS = {
  inprogress:           "In Progress",
  closed:               "Closed",
  invoiced:             "Invoiced",
  offered_and_accepted: "Offered & Accepted",
  offered_and_rejected: "Offered & Rejected",
  position_hold:        "Position Hold",
  internally_closed:    "Internally Closed",
  reallocation:         "Reallocation",
  revised:              "Revised",
  cancelled:            "Cancelled",
  rejected:             "Rejected",
}

const fmtDate = (val) => {
  if (!val) return "—"
  const d = new Date(val)
  if (isNaN(d)) return "—"
  return d.toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })
}

const fmtTimestamp = (val) => {
  if (!val) return "—"
  const d = new Date(val)
  if (isNaN(d)) return "—"
  let h = d.getHours(), m = String(d.getMinutes()).padStart(2,"0")
  const ampm = h >= 12 ? "PM" : "AM"
  h = h % 12 || 12
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()} ${String(h).padStart(2,"0")}:${m} ${ampm}`
}

export default function EnquiryRow({ item, refreshData }) {
  const [showEdit, setShowEdit] = useState(false)
  const sm = STATUS_COLORS[item.enquiryStatus] || { bg:"#F3F4F6", color:"#374151" }

  return (
    <>
      <tr
        style={{ background:"#fff", borderBottom:"1px solid #F3F4F6", cursor:"default" }}
        onMouseEnter={e => e.currentTarget.style.background = "#FAFAFF"}
        onMouseLeave={e => e.currentTarget.style.background = "#fff"}
      >
        <td style={td}>{fmtTimestamp(item.created_at)}</td>
        <td style={{ ...td, fontWeight:500, color:"#1F2937", maxWidth:180, overflow:"hidden", textOverflow:"ellipsis" }}>
          {item.companyName || "—"}
        </td>
        <td style={td}>{item.franchiseeName || "—"}</td>
        <td style={td}>{item.candidateName || "—"}</td>
        <td style={td}>{item.hrExecutiveName || "—"}</td>
        <td style={td}>{item.designation || "—"}</td>
        <td style={td}>
          <span style={{ background:sm.bg, color:sm.color, padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:500, whiteSpace:"nowrap" }}>
            {STATUS_LABELS[item.enquiryStatus] || item.enquiryStatus || "—"}
          </span>
        </td>
        <td style={{ ...td, maxWidth:180, overflow:"hidden", textOverflow:"ellipsis" }}>{item.remarks || "—"}</td>
        <td style={td}>{item.mobileNo || "—"}</td>
        <td style={td}>{item.bill_no || "—"}</td>
        <td style={td}>{fmtDate(item.bill_date)}</td>
        <td style={td}>
          {item.bill_amount ? `₹${Number(item.bill_amount).toLocaleString("en-IN")}` : "—"}
        </td>
        <td style={td}>
          <button
            onClick={() => setShowEdit(true)}
            style={{ background:"#F5F3FF", color:"#5B21B6", border:"1px solid #DDD6FE", borderRadius:6, padding:"4px 14px", cursor:"pointer", fontSize:12, fontWeight:500 }}
          >
            Edit
          </button>
        </td>
      </tr>

      {/* ── FIX: Modal rendered via portal directly into document.body
          Previously modal was rendered inside <tbody> as a sibling of <tr>
          which is invalid HTML — browser breaks the DOM and form submit fails.
          Portal moves it outside the table entirely, fixing the submit bug. ── */}
      {showEdit && createPortal(
        <EditEnquiryModal
          enquiry={item}
          refreshData={refreshData}
          onClose={() => setShowEdit(false)}
        />,
        document.body
      )}
    </>
  )
}

const td = { padding:"12px 14px", fontSize:13, color:"#374151", whiteSpace:"nowrap" }
