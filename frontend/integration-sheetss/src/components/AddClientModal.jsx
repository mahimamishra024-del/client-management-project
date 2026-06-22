import AddClientForm from "./AddClientForm"

export default function AddClientModal({ onClose, refreshData }) {
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>Add New Client</h2>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>
        <div style={styles.body}>
          <AddClientForm refreshData={refreshData} onClose={onClose} />
        </div>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex", alignItems: "center",
    justifyContent: "center", zIndex: 1000,
  },
  modal: {
    background: "#fff", borderRadius: 12,
    width: "90%", maxWidth: 860,
    maxHeight: "90vh", display: "flex",
    flexDirection: "column", overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  },
  header: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", padding: "18px 24px",
    borderBottom: "1px solid #E9D5FF",
    background: "#F5F3FF",
  },
  title: { margin: 0, fontSize: 18, fontWeight: 700, color: "#5B21B6" },
  closeBtn: {
    background: "none", border: "none",
    fontSize: 18, cursor: "pointer", color: "#6B7280",
  },
  body: {
    overflowY: "auto", flex: 1, padding: "0 4px",
  },
}