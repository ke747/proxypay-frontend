import React from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';

export default function TransactionDetailPage(): React.JSX.Element {
  return (
    <Layout
      title="Transaction Detail"
      description="Collapsible transaction detail sections with persistent state"
    >
      <BrowserOnly
        fallback={<p style={{ padding: '2rem' }}>Loading transaction detail...</p>}
      >
        {() => {
          const TransactionDetail = require('../components/TransactionDetail').default;
          return <TransactionDetail />;
        }}
      </BrowserOnly>
    </Layout>
  );
}
