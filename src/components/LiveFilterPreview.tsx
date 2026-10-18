import React, { useState, useCallback } from 'react';

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

interface FilterState {
  status: 'All' | TransactionStatus;
  minAmount: string;
  maxAmount: string;
  currency: string;
}

const ALL_TRANSACTIONS: Transaction[] = [
  { id: 'TXN-001', amount: 250.0, currency: 'USD', status: 'Completed', timestamp: '2024-10-18T14:32:00Z', fee: 1.25, network: 'Stellar' },
  { id: 'TXN-002', amount: 1500.0, currency: 'EUR', status: 'Pending', timestamp: '2024-10-18T15:10:00Z', fee: 4.5, network: 'Stellar' },
  { id: 'TXN-003', amount: 75.0, currency: 'USD', status: 'Failed', timestamp: '2024-10-17T09:00:00Z', fee: 0.5, network: 'Ethereum' },
  { id: 'TXN-004', amount: 320.0, currency: 'GBP', status: 'Completed', timestamp: '2024-10-16T18:45:00Z', fee: 2.0, network: 'Stellar' },
  { id: 'TXN-005', amount: 5000.0, currency: 'NGN', status: 'Processing', timestamp: '2024-10-15T08:20:00Z', fee: 50.0, network: 'Mobile Money' },
  { id: 'TXN-006', amount: 99.99, currency: 'USD', status: 'Completed', timestamp: '2024-10-14T12:00:00Z', fee: 0.99, network: 'Ethereum' },
  { id: 'TXN-007', amount: 450.0, currency: 'KES', status: 'Pending', timestamp: '2024-10-13T10:15:00Z', fee: 5.0, network: 'Mobile Money' },
  { id: 'TXN-008', amount: 180.0, currency: 'USD', status: 'Failed', timestamp: '2024-10-12T16:30:00Z', fee: 1.8, network: 'Stellar' },
  { id: 'TXN-009', amount: 2200.0, currency: 'EUR', status: 'Completed', timestamp: '2024-10-11T07:45:00Z', fee: 8.0, network: 'Stellar' },
  { id: 'TXN-010', amount: 800.0, currency: 'GHS', status: 'Processing', timestamp: '2024-10-10T20:00:00Z', fee: 10.0, network: 'Mobile Money' },
  { id: 'TXN-011', amount: 35.5, currency: 'USD', status: 'Completed', timestamp: '2024-10-09T11:11:00Z', fee: 0.35, network: 'Ethereum' },
  { id: 'TXN-012', amount: 9999.0, currency: 'NGN', status: 'Pending', timestamp: '2024-10-08T22:22:00Z', fee: 100.0, network: 'Mobile Money' },
];

const CURRENCIES = ['All', ...Array.from(new Set(ALL_TRANSACTIONS.map((t) => t.currency)))];

const EMPTY_FILTER: FilterState = {
  status: 'All',
  minAmount: '',
  maxAmount: '',
  currency: 'All',
};

function applyFilter(transactions: Transaction[], filter: FilterState): Transaction[] {
  return transactions.filter((t) => {
    if (filter.status !== 'All' && t.status !== filter.status) return false;
    if (filter.currency !== 'All' && t.currency !== filter.currency) return false;
    if (filter.minAmount !== '') {
      const min = parseFloat(filter.minAmount);
      if (!isNaN(min) && t.amount < min) return false;
    }
    if (filter.maxAmount !== '') {
      const max = parseFloat(filter.maxAmount);
      if (!isNaN(max) && t.amount > max) return false;
    }
    return true;
  });
}

const STATUS_COLORS: Record<string, string> = {
  Completed: '#2e8555',
  Pending: '#f0a500',
  Failed: '#c0392b',
  Processing: '#2980b9',
};

export default function LiveFilterPreview(): React.JSX.Element {
  const [activeFilter, setActiveFilter] = useState<FilterState>(EMPTY_FILTER);
  const [committedFilter, setCommittedFilter] = useState<FilterState>(EMPTY_FILTER);
  const [previousFilter, setPreviousFilter] = useState<FilterState>(EMPTY_FILTER);
  const [toast, setToast] = useState<string>('');

  const filtered = applyFilter(ALL_TRANSACTIONS, activeFilter);
  const preview = filtered.slice(0, 5);

  function showToast(msg: string): void {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }

  const handleApply = useCallback(() => {
    setPreviousFilter(committedFilter);
    setCommittedFilter(activeFilter);
    console.log('[LiveFilter] Applied filter:', activeFilter, '→ results:', filtered.length);
    showToast(`✅ Filter applied — ${filtered.length} transaction(s) matched.`);
  }, [activeFilter, committedFilter, filtered.length]);

  const handleUndo = useCallback(() => {
    setActiveFilter(previousFilter);
    setCommittedFilter(previousFilter);
    showToast('↩ Filter reverted to previous state.');
  }, [previousFilter]);

  const inputStyle: React.CSSProperties = {
    padding: '0.4rem 0.6rem',
    borderRadius: 4,
    border: '1px solid var(--ifm-color-emphasis-300, #ccc)',
    fontSize: '0.9rem',
    width: '100%',
    boxSizing: 'border-box',
  };

  const btnStyle: React.CSSProperties = {
    padding: '0.45rem 1rem',
    borderRadius: 4,
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.9rem',
    marginRight: '0.5rem',
  };

  return (
    <main style={{ padding: '2rem 1.5rem', maxWidth: 900, margin: '0 auto' }}>
      <h1>Live Filter Preview</h1>
      <p style={{ color: 'var(--ifm-color-emphasis-700, #555)' }}>
        Adjust the filters below to instantly preview matching transactions. Click{' '}
        <strong>Apply Filter</strong> to commit.
      </p>

      {toast && (
        <div
          style={{
            padding: '0.7rem 1rem',
            background: '#e6f4ea',
            borderLeft: '4px solid #2e8555',
            borderRadius: 4,
            marginBottom: '1rem',
            color: '#1a5c38',
            fontWeight: 500,
            transition: 'opacity 0.3s',
          }}
        >
          {toast}
        </div>
      )}

      {/* Filter Controls */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '1rem',
          padding: '1.25rem',
          background: 'var(--ifm-background-surface-color, #f9f9f9)',
          border: '1px solid var(--ifm-color-emphasis-300, #ddd)',
          borderRadius: 8,
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.85rem' }}>
            Status
          </label>
          <select
            style={inputStyle}
            value={activeFilter.status}
            onChange={(e) =>
              setActiveFilter((f) => ({
                ...f,
                status: e.target.value as FilterState['status'],
              }))
            }
          >
            {(['All', 'Pending', 'Completed', 'Failed', 'Processing'] as FilterState['status'][]).map(
              (s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ),
            )}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.85rem' }}>
            Currency
          </label>
          <select
            style={inputStyle}
            value={activeFilter.currency}
            onChange={(e) => setActiveFilter((f) => ({ ...f, currency: e.target.value }))}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.85rem' }}>
            Min Amount
          </label>
          <input
            type="number"
            style={inputStyle}
            placeholder="0"
            value={activeFilter.minAmount}
            min={0}
            onChange={(e) => setActiveFilter((f) => ({ ...f, minAmount: e.target.value }))}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.85rem' }}>
            Max Amount
          </label>
          <input
            type="number"
            style={inputStyle}
            placeholder="∞"
            value={activeFilter.maxAmount}
            min={0}
            onChange={(e) => setActiveFilter((f) => ({ ...f, maxAmount: e.target.value }))}
          />
        </div>
      </div>

      {/* Result Count + Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1rem',
        }}
      >
        <div style={{ fontWeight: 700, fontSize: '1rem' }}>
          <span style={{ color: '#2e8555', fontSize: '1.3rem' }}>{filtered.length}</span> /{' '}
          {ALL_TRANSACTIONS.length} transactions match
          {filtered.length > 5 && (
            <span style={{ color: '#777', fontWeight: 400, fontSize: '0.85rem', marginLeft: 8 }}>
              (showing first 5)
            </span>
          )}
        </div>
        <div>
          <button
            style={{ ...btnStyle, background: '#2e8555', color: '#fff' }}
            onClick={handleApply}
          >
            ✅ Apply Filter
          </button>
          <button
            style={{
              ...btnStyle,
              background: 'var(--ifm-background-surface-color, #f5f5f5)',
              color: '#333',
              border: '1px solid #ddd',
            }}
            onClick={handleUndo}
          >
            ↩ Undo Filter
          </button>
        </div>
      </div>

      {/* Preview Table */}
      {preview.length === 0 ? (
        <div
          style={{
            padding: '2rem',
            textAlign: 'center',
            color: '#888',
            border: '1px dashed #ddd',
            borderRadius: 8,
          }}
        >
          No transactions match the current filters.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'var(--ifm-background-surface-color, #f5f5f5)' }}>
                {['ID', 'Amount', 'Currency', 'Status', 'Network', 'Fee', 'Timestamp'].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '0.6rem 0.75rem',
                      textAlign: 'left',
                      borderBottom: '2px solid #ddd',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '0.55rem 0.75rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    {t.id}
                  </td>
                  <td style={{ padding: '0.55rem 0.75rem' }}>{t.amount.toFixed(2)}</td>
                  <td style={{ padding: '0.55rem 0.75rem' }}>{t.currency}</td>
                  <td style={{ padding: '0.55rem 0.75rem' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: 12,
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        background: `${STATUS_COLORS[t.status]}22`,
                        color: STATUS_COLORS[t.status],
                        border: `1px solid ${STATUS_COLORS[t.status]}55`,
                      }}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.55rem 0.75rem' }}>{t.network}</td>
                  <td style={{ padding: '0.55rem 0.75rem' }}>{t.fee.toFixed(2)}</td>
                  <td style={{ padding: '0.55rem 0.75rem', fontSize: '0.82rem', color: '#666' }}>
                    {new Date(t.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reset */}
      <div style={{ marginTop: '1rem' }}>
        <button
          style={{
            ...btnStyle,
            background: 'none',
            border: '1px solid #ddd',
            color: '#666',
            fontSize: '0.85rem',
          }}
          onClick={() => setActiveFilter(EMPTY_FILTER)}
        >
          🔄 Clear All Filters
        </button>
      </div>
    </main>
  );
}
