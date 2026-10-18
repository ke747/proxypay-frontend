import React from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';

export default function LiveFilterPage(): React.JSX.Element {
  return (
    <Layout
      title="Live Filter"
      description="Real-time transaction filtering with instant preview"
    >
      <BrowserOnly
        fallback={<p style={{ padding: '2rem' }}>Loading live filter...</p>}
      >
        {() => {
          const LiveFilterPreview = require('../components/LiveFilterPreview').default;
          return <LiveFilterPreview />;
        }}
      </BrowserOnly>
    </Layout>
  );
}
