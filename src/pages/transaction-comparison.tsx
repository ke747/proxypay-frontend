import React from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';

export default function TransactionComparisonPage(): React.JSX.Element {
  return (
    <Layout
      title="Transaction Comparison"
      description="Side-by-side comparison of ProxyPay transactions"
    >
      <BrowserOnly
        fallback={<p style={{ padding: '2rem' }}>Loading transaction comparison...</p>}
      >
        {() => {
          const TransactionComparison = require('../components/TransactionComparison').default;
          return <TransactionComparison />;
        }}
      </BrowserOnly>
    </Layout>
  );
}
