export function formatDateRO(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("ro-RO");
}

export function formatLeaveType(type) {
  if (!type) return "-";
  if (type === "CO") return "CO";
  if (type === "COR") return "COR";
  return type;
}