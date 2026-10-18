import React, { useState } from 'react';

type TransactionStatus = 'Pending' | 'Completed' | 'Failed' | 'Processing';

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  timestamp: string;
  fee: number;
  network: string;
}

const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: 'TXN-001',
    amount: 250.0,
    currency: 'USD',
    status: 'Completed',
    timestamp: '2024-10-18T14:32:00Z',
    fee: 1.25,
    network: 'Stellar',
  },
  {
    id: 'TXN-002',
    amount: 1500.0,
    currency: 'EUR',
    status: 'Pending',
    timestamp: '2024-10-18T15:10:00Z',
    fee: 4.5,
    network: 'Stellar',
  },
  {
    id: 'TXN-003',
    amount: 75.0,
    currency: 'USD',
    status: 'Failed',
    timestamp: '2024-10-17T09:00:00Z',
    fee: 0.5,
    network: 'Ethereum',
  },
  {
    id: 'TXN-004',
    amount: 320.0,
    currency: 'GBP',
    status: 'Completed',
    timestamp: '2024-10-16T18:45:00Z',
    fee: 2.0,
    network: 'Stellar',
  },
  {
    id: 'TXN-005',
    amount: 5000.0,
    currency: 'NGN',
    status: 'Processing',
    timestamp: '2024-10-15T08:20:00Z',
    fee: 50.0,
    network: 'Mobile Money',
  },
  {
    id: 'TXN-006',
    amount: 99.99,
    currency: 'USD',
    status: 'Completed',
    timestamp: '2024-10-14T12:00:00Z',
    fee: 0.99,
    network: 'Ethereum',
  },
];

const FIELD_LABELS: { key: keyof Transaction; label: string }[] = [
  { key: 'id', label: 'Transaction ID' },
  { key: 'amount', label: 'Amount' },
  { key: 'currency', label: 'Currency' },
  { key: 'status', label: 'Status' },
  { key: 'timestamp', label: 'Timestamp' },
  { key: 'fee', label: 'Fee' },
  { key: 'network', label: 'Network' },
];

function downloadJson(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function formatValue(key: keyof Transaction, value: number | string): string {
  if (key === 'timestamp') return new Date(value as string).toLocaleString();
  if (key === 'amount' || key === 'fee') return Number(value).toFixed(2);
  return String(value);
}

export default function TransactionComparison(): React.JSX.Element {
  const [txnAId, setTxnAId] = useState<string>(SAMPLE_TRANSACTIONS[0].id);
  const [txnBId, setTxnBId] = useState<string>(SAMPLE_TRANSACTIONS[1].id);
  const [showComparison, setShowComparison] = useState<boolean>(false);

  const txnA = SAMPLE_TRANSACTIONS.find((t) => t.id === txnAId) ?? SAMPLE_TRANSACTIONS[0];
  const txnB = SAMPLE_TRANSACTIONS.find((t) => t.id === txnBId) ?? SAMPLE_TRANSACTIONS[1];

  function handleExport(): void {
    const diff: Record<string, { a: string; b: string; differs: boolean }> = {};
    for (const { key, label } of FIELD_LABELS) {
      const valA = formatValue(key, txnA[key]);
      const valB = formatValue(key, txnB[key]);
      diff[label] = { a: valA, b: valB, differs: valA !== valB };
    }
    downloadJson(
      { transactionA: txnA, transactionB: txnB, diff },
      `comparison-${txnA.id}-vs-${txnB.id}.json`,
    );
  }

  const selectStyle: React.CSSProperties = {
    padding: '0.4rem 0.6rem',
    borderRadius: 4,
    border: '1px solid var(--ifm-color-emphasis-300, #ccc)',
    fontSize: '0.95rem',
    minWidth: 180,
  };

  const btnStyle: React.CSSProperties = {
    padding: '0.45rem 1rem',
    borderRadius: 4,
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.9rem',
    marginRight: '0.5rem',
    marginTop: '0.25rem',
  };

  return (
    <main style={{ padding: '2rem 1.5rem', maxWidth: 1000, margin: '0 auto' }}>
      <h1>Transaction Comparison</h1>
      <p style={{ color: 'var(--ifm-color-emphasis-700, #555)' }}>
        Select two transactions to compare side-by-side. Fields that differ are highlighted in
        yellow.
      </p>

      {/* Transaction Selectors */}
      <div
        style={{
          display: 'flex',
          gap: '2rem',
          flexWrap: 'wrap',
          marginBottom: '1.5rem',
          alignItems: 'flex-end',
        }}
      >
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem' }}>
            Transaction A
          </label>
          <select style={selectStyle} value={txnAId} onChange={(e) => setTxnAId(e.target.value)}>
            {SAMPLE_TRANSACTIONS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.id} — {t.amount} {t.currency}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem' }}>
            Transaction B
          </label>
          <select style={selectStyle} value={txnBId} onChange={(e) => setTxnBId(e.target.value)}>
            {SAMPLE_TRANSACTIONS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.id} — {t.amount} {t.currency}
              </option>
            ))}
          </select>
        </div>

        <div>
          <button
            style={{ ...btnStyle, background: '#2e8555', color: '#fff' }}
            onClick={() => setShowComparison(true)}
          >
            ⇄ Compare
          </button>
        </div>
      </div>

      {/* Comparison Table */}
      {showComparison && (
        <div>
          {txnA.id === txnB.id && (
            <div
              style={{
                padding: '0.6rem 1rem',
                background: '#fff8e1',
                borderLeft: '4px solid #f0a500',
                borderRadius: 4,
                marginBottom: '1rem',
                color: '#7a5500',
                fontWeight: 500,
              }}
            >
              ⚠️ You are comparing a transaction with itself. Select two different transactions for a
              meaningful comparison.
            </div>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.92rem' }}>
              <thead>
                <tr style={{ background: 'var(--ifm-background-surface-color, #f5f5f5)' }}>
                  <th
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      borderBottom: '2px solid #ddd',
                      width: '20%',
                    }}
                  >
                    Field
                  </th>
                  <th
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      borderBottom: '2px solid #ddd',
                      width: '40%',
                    }}
                  >
                    {txnA.id}
                  </th>
                  <th
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      borderBottom: '2px solid #ddd',
                      width: '40%',
                    }}
                  >
                    {txnB.id}
                  </th>
                </tr>
              </thead>
              <tbody>
                {FIELD_LABELS.map(({ key, label }) => {
                  const valA = formatValue(key, txnA[key]);
                  const valB = formatValue(key, txnB[key]);
                  const differs = valA !== valB;
                  const rowBg = differs ? '#fffde7' : 'transparent';
                  return (
                    <tr
                      key={key}
                      style={{ borderBottom: '1px solid #eee', background: rowBg }}
                    >
                      <td style={{ padding: '0.65rem 1rem', fontWeight: 600 }}>{label}</td>
                      <td
                        style={{
                          padding: '0.65rem 1rem',
                          fontFamily: 'monospace',
                          color: differs ? '#7a5500' : 'inherit',
                        }}
                      >
                        {valA}
                      </td>
                      <td
                        style={{
                          padding: '0.65rem 1rem',
                          fontFamily: 'monospace',
                          color: differs ? '#7a5500' : 'inherit',
                        }}
                      >
                        {valB}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <p style={{ fontSize: '0.9rem', color: '#777' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: 14,
                  height: 14,
                  background: '#fffde7',
                  border: '1px solid #f0a500',
                  borderRadius: 2,
                  marginRight: 4,
                  verticalAlign: 'middle',
                }}
              />
              Yellow rows indicate fields that differ between the two transactions.
            </p>
            <button
              style={{ ...btnStyle, background: '#2e8555', color: '#fff' }}
              onClick={handleExport}
            >
              ⬇ Export Comparison as JSON
            </button>
            <button
              style={{
                ...btnStyle,
                background: 'var(--ifm-background-surface-color, #f5f5f5)',
                color: '#333',
                border: '1px solid #ddd',
              }}
              onClick={() => setShowComparison(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Transaction List Preview */}
      {!showComparison && (
        <div
          style={{
            border: '1px solid var(--ifm-color-emphasis-300, #ddd)',
            borderRadius: 8,
            padding: '1rem',
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Available Transactions</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                {['ID', 'Amount', 'Currency', 'Status', 'Network', 'Fee'].map((h) => (
                  <th
                    key={h}
                    style={{ padding: '0.5rem 0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SAMPLE_TRANSACTIONS.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '0.5rem 0.75rem', fontFamily: 'monospace' }}>{t.id}</td>
                  <td style={{ padding: '0.5rem 0.75rem' }}>{t.amount.toFixed(2)}</td>
                  <td style={{ padding: '0.5rem 0.75rem' }}>{t.currency}</td>
                  <td style={{ padding: '0.5rem 0.75rem' }}>{t.status}</td>
                  <td style={{ padding: '0.5rem 0.75rem' }}>{t.network}</td>
                  <td style={{ padding: '0.5rem 0.75rem' }}>{t.fee.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
