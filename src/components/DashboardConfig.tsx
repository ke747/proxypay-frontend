import React, { useState, useRef, useEffect } from 'react';

const CONFIG_VERSION = '1.0.0';

interface DashboardSettings {
  version: string;
  theme: 'light' | 'dark' | 'system';
  defaultCurrency: string;
  itemsPerPage: number;
  showFees: boolean;
  showTimeline: boolean;
  refreshInterval: number;
  columns: string[];
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const REQUIRED_FIELDS: (keyof DashboardSettings)[] = [
  'version',
  'theme',
  'defaultCurrency',
  'itemsPerPage',
  'showFees',
  'showTimeline',
  'refreshInterval',
  'columns',
];

const DEFAULT_SETTINGS: DashboardSettings = {
  version: CONFIG_VERSION,
  theme: 'system',
  defaultCurrency: 'USD',
  itemsPerPage: 25,
  showFees: true,
  showTimeline: true,
  refreshInterval: 30,
  columns: ['id', 'amount', 'currency', 'status', 'timestamp'],
};

function validateConfig(raw: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return { valid: false, errors: ['Config must be a JSON object.'] };
  }

  const obj = raw as Record<string, unknown>;

  for (const field of REQUIRED_FIELDS) {
    if (!(field in obj)) {
      errors.push(`Missing required field: "${field}"`);
    }
  }

  if ('version' in obj && typeof obj.version !== 'string') {
    errors.push('"version" must be a string.');
  }
  if ('theme' in obj && !['light', 'dark', 'system'].includes(obj.theme as string)) {
    errors.push('"theme" must be one of: light, dark, system.');
  }
  if ('itemsPerPage' in obj && typeof obj.itemsPerPage !== 'number') {
    errors.push('"itemsPerPage" must be a number.');
  }
  if ('refreshInterval' in obj && typeof obj.refreshInterval !== 'number') {
    errors.push('"refreshInterval" must be a number.');
  }
  if ('columns' in obj && !Array.isArray(obj.columns)) {
    errors.push('"columns" must be an array.');
  }

  return { valid: errors.length === 0, errors };
}

function downloadJson(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function DashboardConfig(): React.JSX.Element {
  const [settings, setSettings] = useState<DashboardSettings>(() => {
    try {
      const stored = localStorage.getItem('dashboard-config');
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        const { valid } = validateConfig(parsed);
        if (valid) return parsed as DashboardSettings;
      }
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  });

  const [importPreview, setImportPreview] = useState<DashboardSettings | null>(null);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from URL hash on mount
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      try {
        const decoded = JSON.parse(atob(hash)) as unknown;
        const { valid, errors } = validateConfig(decoded);
        if (valid) {
          setSettings(decoded as DashboardSettings);
          showStatus('✅ Configuration loaded from URL hash.');
        } else {
          showStatus(`⚠️ URL hash config invalid: ${errors.join(', ')}`);
        }
      } catch {
        // not a config hash
      }
    }
  }, []);

  function showStatus(msg: string): void {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(''), 4000);
  }

  function handleExport(): void {
    downloadJson(settings, `dashboard-config-v${settings.version}.json`);
    showStatus('✅ Configuration exported.');
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed: unknown = JSON.parse(ev.target?.result as string);
        const { valid, errors } = validateConfig(parsed);
        if (valid) {
          setImportPreview(parsed as DashboardSettings);
          setImportErrors([]);
        } else {
          setImportPreview(null);
          setImportErrors(errors);
        }
      } catch {
        setImportPreview(null);
        setImportErrors(['Invalid JSON file.']);
      }
    };
    reader.readAsText(file);
  }

  function handleApplyImport(): void {
    if (!importPreview) return;
    setSettings(importPreview);
    localStorage.setItem('dashboard-config', JSON.stringify(importPreview));
    setImportPreview(null);
    setImportErrors([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    showStatus('✅ Configuration applied.');
  }

  function handleCancelImport(): void {
    setImportPreview(null);
    setImportErrors([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleGenerateShareUrl(): void {
    const encoded = btoa(JSON.stringify(settings));
    const url = `${window.location.origin}${window.location.pathname}#${encoded}`;
    setShareUrl(url);
    showStatus('✅ Share URL generated.');
  }

  function handleCopyUrl(): void {
    navigator.clipboard.writeText(shareUrl).then(() => showStatus('📋 URL copied to clipboard!'));
  }

  function handleSave(): void {
    localStorage.setItem('dashboard-config', JSON.stringify(settings));
    showStatus('✅ Settings saved to browser storage.');
  }

  function handleReset(): void {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem('dashboard-config');
    showStatus('🔄 Settings reset to defaults.');
  }

  const cardStyle: React.CSSProperties = {
    background: 'var(--ifm-card-background-color, #fff)',
    border: '1px solid var(--ifm-color-emphasis-300, #ddd)',
    borderRadius: 8,
    padding: '1.5rem',
    marginBottom: '1.5rem',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 600,
  };

  const inputStyle: React.CSSProperties = {
    padding: '0.4rem 0.6rem',
    borderRadius: 4,
    border: '1px solid var(--ifm-color-emphasis-300, #ccc)',
    fontSize: '0.95rem',
    width: '100%',
    maxWidth: 300,
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
    marginTop: '0.25rem',
  };

  return (
    <main style={{ padding: '2rem 1.5rem', maxWidth: 800, margin: '0 auto' }}>
      <h1>Dashboard Configuration</h1>
      <p style={{ color: 'var(--ifm-color-emphasis-700, #555)' }}>
        Manage, export, import, and share your dashboard settings. Configuration version:{' '}
        <code>{settings.version}</code>
      </p>

      {statusMsg && (
        <div
          style={{
            padding: '0.75rem 1rem',
            background: '#e6f4ea',
            borderLeft: '4px solid #2e8555',
            borderRadius: 4,
            marginBottom: '1rem',
            color: '#1a5c38',
            fontWeight: 500,
          }}
        >
          {statusMsg}
        </div>
      )}

      {/* Settings Form */}
      <div style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Settings</h2>

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Theme</label>
          <select
            style={inputStyle}
            value={settings.theme}
            onChange={(e) =>
              setSettings((s) => ({ ...s, theme: e.target.value as DashboardSettings['theme'] }))
            }
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Default Currency</label>
          <select
            style={inputStyle}
            value={settings.defaultCurrency}
            onChange={(e) => setSettings((s) => ({ ...s, defaultCurrency: e.target.value }))}
          >
            {['USD', 'EUR', 'GBP', 'NGN', 'KES', 'GHS', 'XLM'].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Items Per Page</label>
          <input
            type="number"
            style={inputStyle}
            value={settings.itemsPerPage}
            min={5}
            max={200}
            onChange={(e) =>
              setSettings((s) => ({ ...s, itemsPerPage: parseInt(e.target.value, 10) || 25 }))
            }
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Refresh Interval (seconds)</label>
          <input
            type="number"
            style={inputStyle}
            value={settings.refreshInterval}
            min={5}
            max={600}
            onChange={(e) =>
              setSettings((s) => ({ ...s, refreshInterval: parseInt(e.target.value, 10) || 30 }))
            }
          />
        </div>

        <div style={{ marginBottom: '1rem', display: 'flex', gap: '1.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.showFees}
              onChange={(e) => setSettings((s) => ({ ...s, showFees: e.target.checked }))}
            />
            Show Fees Column
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.showTimeline}
              onChange={(e) => setSettings((s) => ({ ...s, showTimeline: e.target.checked }))}
            />
            Show Timeline
          </label>
        </div>

        <div>
          <button style={{ ...btnStyle, background: '#2e8555', color: '#fff' }} onClick={handleSave}>
            Save Settings
          </button>
          <button
            style={{ ...btnStyle, background: '#f5f5f5', color: '#333' }}
            onClick={handleReset}
          >
            Reset to Defaults
          </button>
        </div>
      </div>

      {/* Export */}
      <div style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Export Configuration</h2>
        <p>Download your current settings as a versioned JSON file.</p>
        <button
          style={{ ...btnStyle, background: '#2e8555', color: '#fff' }}
          onClick={handleExport}
        >
          ⬇ Export as JSON
        </button>
      </div>

      {/* Import */}
      <div style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Import Configuration</h2>
        <p>Upload a previously exported JSON config file. You will see a preview before applying.</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          style={{ marginBottom: '1rem', display: 'block' }}
        />

        {importErrors.length > 0 && (
          <div
            style={{
              padding: '0.75rem 1rem',
              background: '#ffeaea',
              borderLeft: '4px solid #c0392b',
              borderRadius: 4,
              marginBottom: '1rem',
              color: '#7b1a1a',
            }}
          >
            <strong>Validation errors:</strong>
            <ul style={{ margin: '0.25rem 0 0 0', paddingLeft: '1.25rem' }}>
              {importErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {importPreview && (
          <div
            style={{
              padding: '1rem',
              background: '#f0faf5',
              borderLeft: '4px solid #2e8555',
              borderRadius: 4,
              marginBottom: '1rem',
            }}
          >
            <strong>Import Preview:</strong>
            <pre
              style={{
                margin: '0.5rem 0 0',
                fontSize: '0.85rem',
                overflowX: 'auto',
                background: 'none',
                padding: 0,
              }}
            >
              {JSON.stringify(importPreview, null, 2)}
            </pre>
            <div style={{ marginTop: '0.75rem' }}>
              <button
                style={{ ...btnStyle, background: '#2e8555', color: '#fff' }}
                onClick={handleApplyImport}
              >
                ✅ Apply Import
              </button>
              <button
                style={{ ...btnStyle, background: '#f5f5f5', color: '#333' }}
                onClick={handleCancelImport}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Share via URL */}
      <div style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Share Configuration via URL</h2>
        <p>
          Generate a shareable URL with your current configuration base64-encoded in the hash
          fragment.
        </p>
        <button
          style={{ ...btnStyle, background: '#2e8555', color: '#fff' }}
          onClick={handleGenerateShareUrl}
        >
          🔗 Generate Share URL
        </button>
        {shareUrl && (
          <div style={{ marginTop: '1rem' }}>
            <input
              readOnly
              value={shareUrl}
              style={{
                ...inputStyle,
                maxWidth: '100%',
                width: '100%',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                marginBottom: '0.5rem',
              }}
            />
            <button
              style={{ ...btnStyle, background: '#f5f5f5', color: '#333' }}
              onClick={handleCopyUrl}
            >
              📋 Copy URL
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
