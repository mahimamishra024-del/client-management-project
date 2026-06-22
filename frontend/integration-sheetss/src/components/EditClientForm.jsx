import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { getClients, updateClient, deleteClient } from "../services/clientService"

const INDUSTRIES = [
  "IT & Software", "Manufacturing", "Healthcare", "Retail", "Finance",
  "Education", "Real Estate", "Logistics", "Hospitality", "Automobile",
  "Pharma", "Media & Entertainment", "Telecom", "FMCG", "Construction",
]

const SUB_INDUSTRIES = {
  "IT & Software": ["Web Development", "Mobile Apps", "AI & ML", "Cybersecurity", "Cloud Services"],
  "Manufacturing": ["Textile", "Electronics", "Food Processing", "Chemicals", "Heavy Machinery"],
  "Healthcare": ["Hospitals", "Pharma", "Diagnostics", "Medical Devices", "Telemedicine"],
  "Retail": ["E-commerce", "Supermarkets", "Fashion", "Electronics Retail", "Grocery"],
  "Finance": ["Banking", "Insurance", "Investment", "Accounting", "Fintech"],
  "Education": ["K-12", "Higher Education", "EdTech", "Coaching", "Vocational Training"],
  "Real Estate": ["Residential", "Commercial", "Industrial", "Co-working", "Property Management"],
  "Logistics": ["Freight", "Warehousing", "Last Mile", "Cold Chain", "3PL"],
  "Hospitality": ["Hotels", "Restaurants", "Travel", "Events", "Catering"],
  "Automobile": ["OEM", "Auto Parts", "EV", "Dealerships", "Fleet Management"],
}

const COUNTRY_CODES = [
  { code: "+91", country: "India 🇮🇳" },
  { code: "+1", country: "USA 🇺🇸" },
  { code: "+44", country: "UK 🇬🇧" },
  { code: "+971", country: "UAE 🇦🇪" },
  { code: "+61", country: "Australia 🇦🇺" },
  { code: "+65", country: "Singapore 🇸🇬" },
  { code: "+60", country: "Malaysia 🇲🇾" },
  { code: "+49", country: "Germany 🇩🇪" },
  { code: "+33", country: "France 🇫🇷" },
  { code: "+81", country: "Japan 🇯🇵" },
]

// Extract country code and number from stored value like "+91 9876543210"
const parsePhone = (val) => {
  if (!val) return { code: "+91", number: "" }
  const match = val.match(/^(\+\d+)\s(.+)$/)
  if (match) return { code: match[1], number: match[2] }
  return { code: "+91", number: val }
}

export default function EditClientForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingClient, setLoadingClient] = useState(true)
  const [countryCode, setCountryCode] = useState("+91")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [phoneError, setPhoneError] = useState("")

  useEffect(() => {
    const loadClient = async () => {
      try {
        const res = await getClients()
        const found = (res.data.data || []).find((c) => String(c.id) === String(id))
        if (found) {
          const parsed = parsePhone(found.phoneNumber)
          setCountryCode(parsed.code)
          setPhoneNumber(parsed.number)
          setForm(found)
        } else {
          setForm(null)
        }
      } catch (err) {
        console.error("Failed to load client:", err.message)
      } finally {
        setLoadingClient(false)
      }
    }
    loadClient()
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === "industry") {
      setForm(prev => ({ ...prev, industry: value, subIndustry: "" }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
  }

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, "")
    setPhoneNumber(val)
    if (val.length > 0 && val.length !== 10) {
      setPhoneError("Phone number must be 10 digits")
    } else {
      setPhoneError("")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (phoneNumber && phoneNumber.length !== 10) {
      alert("Phone number must be exactly 10 digits")
      return
    }
    setLoading(true)
    try {
      const payload = {
        ...form,
        phoneNumber: phoneNumber ? `${countryCode} ${phoneNumber}` : "",
      }
      await updateClient(id, payload)
      navigate("/")
    } catch (err) {
      alert("Update failed: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm("Delete this client?")) return
    try {
      await deleteClient(id)
      navigate("/")
    } catch (err) {
      alert("Delete failed: " + err.message)
    }
  }

  const toDate = (val) => {
    if (!val) return ""
    const str = String(val)
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str
    if (str.includes("T")) return str.split("T")[0]
    return str
  }

  if (loadingClient) return (
    <div style={styles.page}>
      <div style={{ padding: 40, textAlign: "center", color: "#6B7280" }}>Loading client...</div>
    </div>
  )

  if (!form) return (
    <div style={styles.page}>
      <div style={{ padding: 40, textAlign: "center", color: "#DC2626" }}>Client not found.</div>
    </div>
  )

  const subIndustryOptions = SUB_INDUSTRIES[form.industry] || []

  return (
    <div style={styles.page}>
      <div style={styles.topHeader}>
        <div style={styles.logoWrap} onClick={() => navigate("/")}>
          <div style={styles.logoBadge}>S</div>
          <div style={styles.logoTitle}>Saarthi360</div>
        </div>
      </div>

      <div style={styles.container}>
        <h1 style={styles.pageTitle}>Edit Client — {form.companyName}</h1>

        <form onSubmit={handleSubmit}>

          <div style={styles.card}>
            <SectionHead label="Basic Company Details" />

            <div style={styles.grid3}>
              <Field label="Company Name">
                <input name="companyName" value={form.companyName || ""} onChange={handleChange} style={styles.input} />
              </Field>
              <Field label="Date Client Acquired">
                <input name="dateClientAcquired" type="date" value={toDate(form.dateClientAcquired)} onChange={handleChange} style={styles.input} />
              </Field>
              <Field label="BD Members Name">
                <input name="bdMemberName" value={form.bdMemberName || ""} onChange={handleChange} style={styles.input} />
              </Field>
            </div>

            <div style={styles.grid3}>
              <Field label="Address">
                <input name="address" value={form.address || ""} onChange={handleChange} style={styles.input} />
              </Field>
              <Field label="City">
                <input name="city" value={form.city || ""} onChange={handleChange} style={styles.input} />
              </Field>
              <Field label="Pin Code">
                <input name="pinCode" value={form.pinCode || ""} onChange={handleChange} style={styles.input} />
              </Field>
            </div>

            <div style={styles.grid3}>
              <Field label="Location (Area)">
                <input name="locationArea" value={form.locationArea || ""} onChange={handleChange} style={styles.input} />
              </Field>
              <Field label="State">
                <input name="state" value={form.state || ""} onChange={handleChange} style={styles.input} />
              </Field>
              <Field label="Country">
                <input name="country" value={form.country || ""} onChange={handleChange} style={styles.input} />
              </Field>
            </div>

            <div style={styles.grid3}>
              <Field label="Year Of Establishment">
                <input name="yearOfEstablishment" value={form.yearOfEstablishment || ""} onChange={handleChange} style={styles.input} />
              </Field>

              <Field label="Industry">
                <input
                  name="industry"
                  value={form.industry || ""}
                  onChange={handleChange}
                  style={styles.input}
                  list="industryOptions"
                  placeholder="Select or type industry"
                />
                <datalist id="industryOptions">
                  {INDUSTRIES.map(i => <option key={i} value={i} />)}
                </datalist>
              </Field>

              <Field label="Sub Industry">
                <input
                  name="subIndustry"
                  value={form.subIndustry || ""}
                  onChange={handleChange}
                  style={styles.input}
                  list="subIndustryOptions"
                  placeholder="Select or type sub industry"
                />
                <datalist id="subIndustryOptions">
                  {subIndustryOptions.map(s => <option key={s} value={s} />)}
                </datalist>
              </Field>
            </div>

            <div style={styles.grid3}>
              <Field label="Tags">
                <input name="tags" value={form.tags || ""} onChange={handleChange} style={styles.input} />
              </Field>
              <Field label="Company Constitution">
                <select name="companyConstitution" value={form.companyConstitution || ""} onChange={handleChange} style={styles.input}>
                  <option value="">Select</option>
                  <option value="Pvt Ltd">Pvt Ltd</option>
                  <option value="LLP">LLP</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Proprietorship">Proprietorship</option>
                  <option value="Public Ltd">Public Ltd</option>
                </select>
              </Field>
              <Field label="Number Of Employees">
                <select name="numberOfEmployees" value={form.numberOfEmployees || ""} onChange={handleChange} style={styles.input}>
                  <option value="">Select Range</option>
                  <option value="1-10">1-10</option>
                  <option value="11-50">11-50</option>
                  <option value="51-200">51-200</option>
                  <option value="201-500">201-500</option>
                  <option value="500+">500+</option>
                </select>
              </Field>
            </div>

            <div style={styles.grid2}>
              <Field label="GST Number">
                <input name="gstNo" value={form.gstNo || ""} onChange={handleChange} maxLength={15} style={styles.input} />
              </Field>
              <Field label="Website">
                <input name="website" value={form.website || ""} onChange={handleChange} style={styles.input} />
              </Field>
            </div>
          </div>

          <div style={styles.card}>
            <SectionHead label="Contact Person in Company" />
            <div style={styles.grid2}>
              <Field label="Contact Person Name">
                <input name="contactPersonName" value={form.contactPersonName || ""} onChange={handleChange} style={styles.input} />
              </Field>
              <Field label="Designation">
                <input name="designation" value={form.designation || ""} onChange={handleChange} style={styles.input} />
              </Field>
            </div>
            <div style={styles.grid2}>
              <Field label="Phone Number">
                <div style={styles.phoneWrap}>
                  <select
                    value={countryCode}
                    onChange={e => setCountryCode(e.target.value)}
                    style={styles.countrySelect}
                  >
                    {COUNTRY_CODES.map(c => (
                      <option key={c.code} value={c.code}>{c.code} {c.country}</option>
                    ))}
                  </select>
                  <input
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    style={{ ...styles.input, borderLeft: "none", borderRadius: "0 6px 6px 0" }}
                    placeholder="10 digit number"
                    maxLength={10}
                  />
                </div>
                {phoneError && <p style={styles.errorText}>{phoneError}</p>}
              </Field>
              <Field label="Email ID">
                <input name="emailId" type="email" value={form.emailId || ""} onChange={handleChange} style={styles.input} />
              </Field>
            </div>
            <Field label="Contact Person Status">
              <select name="contactPersonStatus" value={form.contactPersonStatus || "Active"} onChange={handleChange} style={{ ...styles.input, maxWidth: 220 }}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </Field>
          </div>

          <div style={styles.card}>
            <SectionHead label="Business Information" />
            <div style={styles.grid2}>
              <Field label="Placement Fees">
                <input name="placementFees" type="number" value={form.placementFees || ""} onChange={handleChange} style={styles.input} />
              </Field>
              <Field label="Additional Placement Fees">
                <div style={styles.radioRow}>
                  <label style={styles.radio}>
                    <input type="radio" name="additionalPlacementFees" value="Yes" checked={form.additionalPlacementFees === "Yes"} onChange={handleChange} /> Yes
                  </label>
                  <label style={styles.radio}>
                    <input type="radio" name="additionalPlacementFees" value="No" checked={form.additionalPlacementFees === "No"} onChange={handleChange} /> No
                  </label>
                </div>
              </Field>
            </div>

            <div style={styles.grid2}>
              <Field label="Credit Period">
                <select name="creditPeriod" value={form.creditPeriod || ""} onChange={handleChange} style={styles.input}>
                  <option value="">Select</option>
                  <option value="15">15 days</option>
                  <option value="30">30 days</option>
                  <option value="45">45 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                </select>
              </Field>
              <Field label="Replacement Period">
                <select name="replacementPeriod" value={form.replacementPeriod || ""} onChange={handleChange} style={styles.input}>
                  <option value="">Select</option>
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                  <option value="180">180 days</option>
                </select>
              </Field>
            </div>

            <div style={styles.grid3}>
              <Field label="Company Category">
                <select name="companyCategory" value={form.companyCategory || ""} onChange={handleChange} style={styles.input}>
                  <option value="">Select</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              </Field>
              <Field label="Company Status">
                <select name="companyStatus" value={form.companyStatus || ""} onChange={handleChange} style={styles.input}>
                  <option value="">Select</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Prospect">Prospect</option>
                </select>
              </Field>
              <Field label="Approval Status">
                <select name="approvalStatus" value={form.approvalStatus || ""} onChange={handleChange} style={styles.input}>
                  <option value="">Select</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </Field>
            </div>

            <Field label="Remarks">
              <textarea name="remarks" value={form.remarks || ""} onChange={handleChange} rows={3} style={{ ...styles.input, resize: "vertical" }} />
            </Field>

            <div style={styles.grid3}>
              <Field label="Date Of Revival Call">
                <input name="dateOfRevivalCall" type="date" value={toDate(form.dateOfRevivalCall)} onChange={handleChange} style={styles.input} />
              </Field>
              <Field label="Name Of Executive">
                <input name="nameOfExecutive" value={form.nameOfExecutive || ""} onChange={handleChange} style={styles.input} />
              </Field>
              <Field label="Status Of Call">
                <select name="statusOfCall" value={form.statusOfCall || ""} onChange={handleChange} style={styles.input}>
                  <option value="">Select</option>
                  <option value="Connected">Connected</option>
                  <option value="Not Connected">Not Connected</option>
                  <option value="Follow Up">Follow Up</option>
                </select>
              </Field>
            </div>

            <div style={styles.grid3}>
              <Field label="E-Meet">
                <select name="eMeet" value={form.eMeet || "No"} onChange={handleChange} style={styles.input}>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </Field>
              <Field label="Updated">
                <div style={styles.radioRow}>
                  <label style={styles.radio}>
                    <input type="radio" name="updated" value="Yes" checked={form.updated === "Yes"} onChange={handleChange} /> Yes
                  </label>
                  <label style={styles.radio}>
                    <input type="radio" name="updated" value="No" checked={form.updated === "No"} onChange={handleChange} /> No
                  </label>
                </div>
              </Field>
            </div>

            <div style={styles.grid2}>
              <Field label="Date Of Data Update">
                <input name="dateOfDataUpdate" type="date" value={toDate(form.dateOfDataUpdate)} onChange={handleChange} style={styles.input} />
              </Field>
              <Field label="Data Updated By">
                <input name="dataUpdatedBy" value={form.dataUpdatedBy || ""} onChange={handleChange} style={styles.input} />
              </Field>
            </div>
          </div>

          <div style={styles.card}>
            <SectionHead label="Franchise & Team Details" />
            <div style={styles.grid3}>
              <Field label="Team Leader">
                <input
                  name="teamLeader"
                  value={form.teamLeader || ""}
                  onChange={handleChange}
                  style={styles.input}
                  list="teamLeaderOptions"
                  placeholder="Select or type a name"
                />
                <datalist id="teamLeaderOptions">
                  <option value="Rohit Mehta" />
                  <option value="Karan Patel" />
                  <option value="Sneha Kulkarni" />
                  <option value="Amit Jain" />
                </datalist>
              </Field>
              <Field label="Franchisee Name">
                <input name="franchiseeName" value={form.franchiseeName || ""} onChange={handleChange} style={styles.input} />
              </Field>
              <Field label="Date Of Client Allocation">
                <input name="dateOfClientAllocation" type="date" value={toDate(form.dateOfClientAllocation)} onChange={handleChange} style={styles.input} />
              </Field>
            </div>
            <Field label="Reallocation Status">
              <select name="reallocationStatus" value={form.reallocationStatus || "No"} onChange={handleChange} style={{ ...styles.input, maxWidth: 200 }}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </Field>
          </div>

          <div style={styles.card}>
            <SectionHead label="Billing (Tally)" />
            <div style={styles.grid3}>
              <Field label="Billing Status">
                <select name="billingStatus" value={form.billingStatus || "pending"} onChange={handleChange} style={styles.input}>
                  <option value="pending">Pending</option>
                  <option value="closed">Closed</option>
                  <option value="invoiced">Invoiced</option>
                </select>
              </Field>
              <Field label="Bill No">
                <input name="bill_no" value={form.bill_no || ""} onChange={handleChange} style={styles.input} placeholder="e.g. INV-001" />
              </Field>
              <Field label="Bill Amount">
                <input name="bill_amount" type="number" value={form.bill_amount || ""} onChange={handleChange} style={styles.input} placeholder="e.g. 5000" />
              </Field>
            </div>
            <div style={styles.grid3}>
              <Field label="Bill Date">
                <input name="bill_date" type="date" value={toDate(form.bill_date)} onChange={handleChange} style={styles.input} />
              </Field>
              <Field label="Tally Status">
                <div style={{ paddingTop: 8, fontSize: 13, color: form.tally_pushed ? "#15803D" : "#9CA3AF", fontWeight: 500 }}>
                  {form.tally_pushed ? "✅ Pushed to Tally" : "⏳ Not pushed yet"}
                </div>
              </Field>
            </div>
          </div>

          <div style={styles.btnRow}>
            <button type="submit" disabled={loading} style={styles.saveBtn}>
              {loading ? "Saving..." : "Save"}
            </button>
            <button type="button" onClick={() => navigate("/")} style={styles.cancelBtn}>
              Cancel
            </button>
            <button type="button" onClick={handleDelete} style={styles.deleteBtn}>
              Delete
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function SectionHead({ label }) {
  return <h3 style={styles.sectionHead}>{label}</h3>
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={styles.label}>{label}</label>
      {children}
    </div>
  )
}

const styles = {
  page: { minHeight: "100vh", background: "#F5F3FF", fontFamily: "'Segoe UI', sans-serif" },
  topHeader: {
    background: "#fff", borderBottom: "1px solid #E9D5FF",
    padding: "14px 28px", display: "flex", alignItems: "center",
  },
  logoWrap: { display: "flex", alignItems: "center", gap: 10, cursor: "pointer" },
  logoBadge: {
    width: 36, height: 36, borderRadius: 10, background: "#5B21B6",
    color: "#fff", fontWeight: 700, fontSize: 16,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  logoTitle: { fontSize: 17, fontWeight: 700, color: "#5B21B6" },
  container: { maxWidth: 880, margin: "0 auto", padding: "28px 20px 60px" },
  pageTitle: { fontSize: 24, fontWeight: 700, color: "#5B21B6", marginBottom: 20 },
  card: {
    background: "#fff", border: "1px solid #E9D5FF", borderRadius: 12,
    padding: "22px 24px", marginBottom: 20,
  },
  sectionHead: {
    margin: "0 0 18px", fontSize: 15, fontWeight: 700, color: "#5B21B6",
    borderBottom: "2px solid #EDE9FE", paddingBottom: 8,
  },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 },
  label: { display: "block", fontSize: 12, fontWeight: 500, color: "#374151", marginBottom: 6 },
  input: {
    width: "100%", padding: "9px 12px", border: "1px solid #D1D5DB",
    borderRadius: 6, fontSize: 13, boxSizing: "border-box",
    outline: "none", background: "#fff", color: "#1F2937",
  },
  phoneWrap: { display: "flex" },
  countrySelect: {
    padding: "9px 8px", border: "1px solid #D1D5DB", borderRight: "none",
    borderRadius: "6px 0 0 6px", fontSize: 13, background: "#F9FAFB",
    color: "#374151", cursor: "pointer", outline: "none", flexShrink: 0,
  },
  errorText: { margin: "4px 0 0", fontSize: 11, color: "#DC2626" },
  radioRow: { display: "flex", gap: 16, alignItems: "center", paddingTop: 8 },
  radio: { display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" },
  btnRow: { display: "flex", gap: 12, marginTop: 8, marginBottom: 40 },
  saveBtn: {
    background: "#5B21B6", color: "#fff", border: "none",
    padding: "10px 28px", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600,
  },
  cancelBtn: {
    background: "#F3F4F6", color: "#374151", border: "none",
    padding: "10px 28px", borderRadius: 8, cursor: "pointer", fontSize: 14,
  },
  deleteBtn: {
    background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA",
    padding: "10px 28px", borderRadius: 8, cursor: "pointer", fontSize: 14,
  },
}