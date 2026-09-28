export default function ConfirmModal({
  open,
  title,
  body,
  confirmLabel = 'Delete',
  busy,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4" onClick={onCancel}>
      <div className="card w-full max-w-sm p-6 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-pa-rose/15 text-lg text-pa-rose">
          ⌫
        </div>
        <h2 className="mt-3 font-display text-2xl">{title}</h2>
        <p className="mt-2 text-sm text-pa-muted">{body}</p>
        <div className="mt-6 grid grid-cols-2 gap-2">
          <button type="button" className="btn-ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button
            type="button"
            className="rounded-full bg-pa-rose px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
