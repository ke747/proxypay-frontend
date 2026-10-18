import React, { useState, useEffect } from 'react';

interface Section {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface SectionsState {
  [sectionId: string]: boolean;
}

const STORAGE_KEY = 'txn-sections-state';

const SAMPLE_TRANSACTION = {
  id: 'TXN-20241018-001',
  amount: 250.0,
  currency: 'USD',
  status: 'Completed',
  timestamp: '2024-10-18T14:32:00Z',
  fee: 1.25,
  network: 'Stellar',
  sender: 'GABC1234EXAMPLE',
  receiver: 'GXYZ5678EXAMPLE',
  memo: 'Payment for services rendered',
  blockHeight: 12345678,
  confirmations: 6,
};

const SECTIONS: Section[] = [
  {
    id: 'overview',
    title: 'Overview',
    content: (
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {[
            ['Transaction ID', SAMPLE_TRANSACTION.id],
            ['Status', SAMPLE_TRANSACTION.status],
            ['Network', SAMPLE_TRANSACTION.network],
            ['Timestamp', new Date(SAMPLE_TRANSACTION.timestamp).toLocaleString()],
          ].map(([label, value]) => (
            <tr key={label} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600, width: '40%' }}>{label}</td>
              <td style={{ padding: '0.5rem 0.75rem', fontFamily: 'monospace' }}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ),
  },
  {
    id: 'fees',
    title: 'Fees',
    content: (
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {[
            ['Amount', `${SAMPLE_TRANSACTION.amount} ${SAMPLE_TRANSACTION.currency}`],
            ['Fee', `${SAMPLE_TRANSACTION.fee} ${SAMPLE_TRANSACTION.currency}`],
            [
              'Total Charged',
              `${(SAMPLE_TRANSACTION.amount + SAMPLE_TRANSACTION.fee).toFixed(2)} ${SAMPLE_TRANSACTION.currency}`,
            ],
            ['Fee %', `${((SAMPLE_TRANSACTION.fee / SAMPLE_TRANSACTION.amount) * 100).toFixed(3)}%`],
          ].map(([label, value]) => (
            <tr key={label} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600, width: '40%' }}>{label}</td>
              <td style={{ padding: '0.5rem 0.75rem', fontFamily: 'monospace' }}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ),
  },
  {
    id: 'metadata',
    title: 'Metadata',
    content: (
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {[
            ['Sender', SAMPLE_TRANSACTION.sender],
            ['Receiver', SAMPLE_TRANSACTION.receiver],
            ['Memo', SAMPLE_TRANSACTION.memo],
            ['Block Height', String(SAMPLE_TRANSACTION.blockHeight)],
            ['Confirmations', String(SAMPLE_TRANSACTION.confirmations)],
          ].map(([label, value]) => (
            <tr key={label} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600, width: '40%' }}>{label}</td>
              <td style={{ padding: '0.5rem 0.75rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    ),
  },
  {
    id: 'timeline',
    title: 'Timeline',
    content: (
      <ol style={{ paddingLeft: '1.25rem', margin: 0 }}>
        {[
          { time: '14:30:00', event: 'Transaction initiated by sender' },
          { time: '14:30:02', event: 'Broadcast to Stellar network' },
          { time: '14:30:05', event: 'Picked up by validator node' },
          { time: '14:31:10', event: 'Included in block #12345678' },
          { time: '14:32:00', event: 'Transaction confirmed (6 confirmations)' },
        ].map((step) => (
          <li key={step.time} style={{ marginBottom: '0.6rem' }}>
            <code style={{ marginRight: '0.5rem', fontSize: '0.85rem' }}>{step.time}</code>
            {step.event}
          </li>
        ))}
      </ol>
    ),
  },
  {
    id: 'raw',
    title: 'Raw JSON',
    content: (
      <pre
        style={{
          background: '#f8f8f8',
          padding: '1rem',
          borderRadius: 4,
          overflow: 'auto',
          fontSize: '0.82rem',
          margin: 0,
        }}
      >
        {JSON.stringify(SAMPLE_TRANSACTION, null, 2)}
      </pre>
    ),
  },
];

function loadState(): SectionsState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as SectionsState;
  } catch {
    // ignore
  }
  // Default: first two sections open
  const defaults: SectionsState = {};
  SECTIONS.forEach((s, i) => {
    defaults[s.id] = i < 2;
  });
  return defaults;
}

function saveState(state: SectionsState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export default function TransactionDetail(): React.JSX.Element {
  const [openState, setOpenState] = useState<SectionsState>(loadState);

  // Persist whenever state changes
  useEffect(() => {
    saveState(openState);
  }, [openState]);

  function toggle(id: string): void {
    setOpenState((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function expandAll(): void {
    const all: SectionsState = {};
    SECTIONS.forEach((s) => {
      all[s.id] = true;
    });
    setOpenState(all);
  }

  function collapseAll(): void {
    const none: SectionsState = {};
    SECTIONS.forEach((s) => {
      none[s.id] = false;
    });
    setOpenState(none);
  }

  const btnStyle: React.CSSProperties = {
    padding: '0.4rem 0.9rem',
    borderRadius: 4,
    border: '1px solid var(--ifm-color-emphasis-300, #ccc)',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.85rem',
    marginRight: '0.5rem',
    background: 'var(--ifm-background-surface-color, #fff)',
  };

  return (
    <main style={{ padding: '2rem 1.5rem', maxWidth: 800, margin: '0 auto' }}>
      <h1>Transaction Detail</h1>
      <p style={{ color: 'var(--ifm-color-emphasis-700, #555)' }}>
        Transaction <code>{SAMPLE_TRANSACTION.id}</code> — collapsible sections with persistent
        state.
      </p>

      <div style={{ marginBottom: '1.25rem' }}>
        <button style={btnStyle} onClick={expandAll}>
          ▼ Expand All
        </button>
        <button style={btnStyle} onClick={collapseAll}>
          ▶ Collapse All
        </button>
      </div>

      <div>
        {SECTIONS.map((section) => {
          const isOpen = !!openState[section.id];
          return (
            <div
              key={section.id}
              style={{
                border: '1px solid var(--ifm-color-emphasis-300, #ddd)',
                borderRadius: 6,
                marginBottom: '0.75rem',
                overflow: 'hidden',
                borderLeft: isOpen ? '4px solid #2e8555' : '4px solid transparent',
                transition: 'border-left-color 0.2s ease',
              }}
            >
              {/* Section Header */}
              <button
                onClick={() => toggle(section.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  background: 'var(--ifm-background-surface-color, #f9f9f9)',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: 'var(--ifm-font-color-base, #333)',
                }}
                aria-expanded={isOpen}
              >
                <span>{section.title}</span>
                <span
                  style={{
                    display: 'inline-block',
                    transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.25s ease',
                    fontSize: '0.9rem',
                    lineHeight: 1,
                  }}
                  aria-hidden="true"
                >
                  ▶
                </span>
              </button>

              {/* Section Body */}
              <div
                style={{
                  maxHeight: isOpen ? '1000px' : '0',
                  overflow: 'hidden',
                  transition: 'max-height 0.3s ease',
                }}
              >
                <div style={{ padding: '1rem' }}>{section.content}</div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
