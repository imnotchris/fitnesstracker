import { C } from '../data.js'

export default function CheckRow({ checked, label, color, onToggle }) {
  return (
    <div
      onClick={onToggle}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '8px 14px', cursor: 'pointer',
        background: checked ? 'rgba(34,197,94,0.06)' : 'transparent',
      }}
    >
      <div style={{
        width: 20, height: 20, borderRadius: 4, flexShrink: 0,
        border: `2px solid ${checked ? color : C.dim}`,
        background: checked ? color : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {checked && (
          <span style={{ color: '#fff', fontSize: 12, fontWeight: 900 }}>✓</span>
        )}
      </div>
      <span style={{ fontSize: 14, color: checked ? C.text : C.sub }}>
        {label}
      </span>
    </div>
  )
}
