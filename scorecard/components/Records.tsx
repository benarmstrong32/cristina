import { FIELDS, type Field } from "@/config/fields";

type Kind = "deals" | "intros" | "triage";

function value(row: Record<string, unknown> | undefined, f: Field) {
  const v = row?.[f.key];
  if (v == null) return "";
  if (f.key === "confidence" && typeof v === "number") return String(Math.round(v * 100));
  if (f.key === "ad_channel") return "";
  return String(v);
}

function Input({ f, row }: { f: Field; row?: Record<string, unknown> }) {
  const v = value(row, f);
  const id = `${f.key}-${String(row?.id ?? "new")}`;
  const common = { id, name: f.key, defaultValue: v };
  return (
    <label className={`rf-field${f.wide ? " wide" : ""}`} htmlFor={id}>
      <span>{f.label}</span>
      {f.type === "select" ? (
        <select {...common} defaultValue={f.key === "ad_channel" ? (row?.ad_channel ? String(row.ad_channel) : f.options![0]) : v}>
          {f.options!.map((o) => <option key={o} value={o}>{o || "—"}</option>)}
          {v && !f.options!.includes(v) && f.key !== "ad_channel" ? <option value={v}>{v}</option> : null}
        </select>
      ) : f.type === "textarea" ? (
        <textarea {...common} rows={2} />
      ) : (
        <input {...common} type={f.type === "number" ? "text" : f.type} inputMode={f.type === "number" ? "decimal" : undefined} required={f.key === "company"} />
      )}
      {f.hint ? <small>{f.hint}</small> : null}
    </label>
  );
}

/** Add or edit form for one record. Saving posts to /api/records and comes back to `back`. */
export function RecordForm({ kind, row, version, back, label }: { kind: Kind; row?: Record<string, unknown>; version: number; back: string; label?: string }) {
  const id = row?.id ? String(row.id) : "";
  return (
    <div className="rf">
      <form method="post" action="/api/records" className="rf-grid">
        <input type="hidden" name="collection" value={kind} />
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="version" value={version} />
        <input type="hidden" name="back" value={back} />
        {FIELDS[kind].map((f) => <Input key={f.key} f={f} row={row} />)}
        <div className="rf-actions wide">
          <button type="submit" className="btn-primary">{label ?? (id ? "Save changes" : "Add")}</button>
        </div>
      </form>
      {id ? (
        <form method="post" action="/api/records" className="rf-delete">
          <input type="hidden" name="collection" value={kind} />
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="version" value={version} />
          <input type="hidden" name="back" value={back} />
          <input type="hidden" name="action" value="delete" />
          <label><input type="checkbox" name="confirm" value="yes" /> Yes, delete it</label>
          <button type="submit" className="btn-link">Delete</button>
        </form>
      ) : null}
    </div>
  );
}

export function SaveNotice({ saved, error }: { saved?: string; error?: string }) {
  if (error) return <div className="notice save-err" role="alert"><strong>Not saved.</strong> {error}</div>;
  if (saved) return <div className="notice save-ok" role="status"><strong>{saved}</strong> The numbers on every tab now include it.</div>;
  return null;
}
