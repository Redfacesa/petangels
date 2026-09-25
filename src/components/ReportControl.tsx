import { FormEvent, useState } from 'react';
import { reportContent } from '../lib/db';

const reasons = [
  { id: 'welfare', label: 'Animal welfare concern', welfare: true },
  { id: 'illegal_sale', label: 'Illegal animal sale', welfare: true },
  { id: 'fake_rescue', label: 'Fake rescue', welfare: true },
  { id: 'scam', label: 'Scam / fraud', welfare: false },
  { id: 'inappropriate', label: 'Inappropriate content', welfare: false },
  { id: 'harassment', label: 'Harassment', welfare: false },
  { id: 'other', label: 'Other', welfare: false },
];

export default function ReportControl({
  reporterId,
  targetKind,
  targetId,
}: {
  reporterId?: string;
  targetKind: string;
  targetId: string;
}) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!reporterId) return;
    const fd = new FormData(e.currentTarget);
    const reason = String(fd.get('reason') || 'other');
    const meta = reasons.find((r) => r.id === reason);
    try {
      await reportContent({
        reporterId,
        targetKind,
        targetId,
        reason,
        welfare: Boolean(meta?.welfare),
      });
      setDone(true);
      setOpen(false);
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : 'Could not send report');
    }
  }

  if (!reporterId) return null;
  if (done) return <p className="text-[11px] text-pa-muted">Report received</p>;

  return (
    <div>
      <button type="button" className="text-[11px] font-semibold text-pa-muted" onClick={() => setOpen((v) => !v)}>
        Report
      </button>
      {open && (
        <form className="mt-2 space-y-2 rounded-2xl bg-pa-sand p-3" onSubmit={(e) => void onSubmit(e)}>
          <p className="text-xs font-semibold">Why are you reporting this?</p>
          {reasons.map((r) => (
            <label key={r.id} className="flex items-center gap-2 text-xs">
              <input type="radio" name="reason" value={r.id} required />
              {r.label}
              {r.welfare ? <span className="text-pa-rose">welfare</span> : null}
            </label>
          ))}
          {err && <p className="text-xs text-pa-rose">{err}</p>}
          <button className="btn-rose !min-h-8 !px-3 !py-1 text-xs" type="submit">
            Submit report
          </button>
        </form>
      )}
    </div>
  );
}
