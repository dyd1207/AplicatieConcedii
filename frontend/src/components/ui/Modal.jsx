export default function Modal({ title, open, onClose, children, footer }) {
  if (!open) return null;

  const stop = (e) => e.stopPropagation();

  return (
    <div className="app-modal-overlay" onMouseDown={onClose} role="dialog" aria-modal="true">
      <div className="app-modal-dialog" onMouseDown={stop}>
        <div className="app-card p-0" style={{ borderRadius: 14 }}>
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
          </div>

          <div className="modal-body">{children}</div>

          <div className="modal-footer">{footer}</div>
        </div>
      </div>
    </div>
  );
}