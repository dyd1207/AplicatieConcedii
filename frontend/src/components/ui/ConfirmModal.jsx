import Modal from "./Modal";

export default function ConfirmModal({
  open,
  title = "Confirmare",
  message,
  confirmText = "Confirmă",
  cancelText = "Anulează",
  onConfirm,
  onCancel,
  loading = false,
}) {
  return (
    <Modal
      title={title}
      open={open}
      onClose={() => !loading && onCancel()}
      footer={
        <div className="d-flex justify-content-end gap-2">
          <button
            className="btn btn-outline-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>

          <button
            className="btn btn-primary"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Se procesează..." : confirmText}
          </button>
        </div>
      }
    >
      <p className="mb-0">{message}</p>
    </Modal>
  );
}