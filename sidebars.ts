import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting started',
      collapsed: false,
      items: [
        'getting-started/quick-start',
        'getting-started/installation',
        'getting-started/first-store',
      ],
    },
    {
      type: 'category',
      label: 'Magento extension',
      items: [
        'magento-extension/install',
        'magento-extension/configuration',
        'magento-extension/indexer',
      ],
    },
    {
      type: 'category',
      label: 'MCP gateway',
      items: [
        'mcp/overview',
        'mcp/connecting-claude',
        'mcp/tools',
      ],
    },
    {
      type: 'category',
      label: 'Stores & usage',
      items: [
        'stores/overview',
        'stores/api-keys',
        'stores/usage-analytics',
      ],
    },
    {
      type: 'category',
      label: 'API',
      items: [
        'api/graphql',
        'api/webhooks',
      ],
    },
    'troubleshooting',
  ],
};

export default sidebars;
