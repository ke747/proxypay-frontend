import React from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';

export default function DashboardConfigPage(): React.JSX.Element {
  return (
    <Layout
      title="Dashboard Config"
      description="Import, export, and share your ProxyPay dashboard configuration"
    >
      <BrowserOnly
        fallback={<p style={{ padding: '2rem' }}>Loading dashboard configuration...</p>}
      >
        {() => {
          const DashboardConfig = require('../components/DashboardConfig').default;
          return <DashboardConfig />;
        }}
      </BrowserOnly>
    </Layout>
  );
}
