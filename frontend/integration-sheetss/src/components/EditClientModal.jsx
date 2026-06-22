import { createPortal } from "react-dom"
import EditClientForm from "./EditClientForm"

export default function EditClientModal({ client, onClose, refreshData }) {
  return createPortal(
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>

        <div style={styles.header}>
          <h2 style={styles.title}>Edit Client</h2>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <div style={styles.body}>
          <EditClientForm client={client} refreshData={refreshData} onClose={onClose} />
        </div>

      </div>
    </div>,
    document.body
  )
}

const styles = {
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.45)",
    zIndex: 1000,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  modal: {
    background: "#fff", borderRadius: 14,
    width: "90%", maxWidth: 780,
    maxHeight: "90vh",
    display: "flex", flexDirection: "column",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "18px 24px",
    borderBottom: "1px solid #E9D5FF",
  },
  title: {
    margin: 0, fontSize: 20, fontWeight: 700, color: "#5B21B6",
  },
  closeBtn: {
    background: "none", border: "none", fontSize: 18,
    cursor: "pointer", color: "#6B7280",
  },
  body: {
    padding: "20px 24px",
    overflowY: "auto",
    flex: 1,
  },
}