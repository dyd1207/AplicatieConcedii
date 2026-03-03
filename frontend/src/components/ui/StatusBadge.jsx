export default function StatusBadge({ status }) {
  if (!status) return null;

  const map = {
    DRAFT: { text: "DRAFT", cls: "bg-secondary" },
    SUBMITTED: { text: "SUBMITTED", cls: "badge-pending" }, // portocaliu din theme.css
    APPROVED: { text: "APPROVED", cls: "badge-approved" }, // verde
    REJECTED: { text: "REJECTED", cls: "badge-rejected" }, // roșu
    CANCELLED: { text: "CANCELLED", cls: "bg-dark" },
    INTERRUPTED: { text: "INTERRUPTED", cls: "bg-info" },
  };

  const v = map[status] || { text: status, cls: "bg-secondary" };

  return <span className={`badge ${v.cls}`}>{v.text}</span>;
}