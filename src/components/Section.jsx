import { useState } from 'react'
import { C, FONT } from '../data.js'

export default function Section({ title, icon, children }) {
  const [open, setOpen] = useState(true)

  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 12, marginBottom: 12, overflow: 'hidden',
    }}>
      <button
        onClick={() => setOpen((p) => !p)}
        style={{
          width: '100%', background: 'none', border: 'none',
          padding: '12px 14px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', cursor: 'pointer', fontFamily: FONT,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>{icon}</span>
          <span style={{
            fontSize: 13, fontWeight: 800, color: C.sub,
            letterSpacing: 2, textTransform: 'uppercase',
          }}>
            {title}
          </span>
        </div>
        <span style={{ color: C.dim, fontSize: 14 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{ borderTop: `1px solid ${C.border}`, padding: '6px 0 4px' }}>
          {children}
        </div>
      )}
    </div>
  )
}
