import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Byte8 Horizon',
  tagline:
    'MCP gateway for Magento 2 catalogs. Make your storefront discoverable to Claude, ChatGPT, and every agent that speaks the Model Context Protocol.',
  favicon: 'img/favicon.svg',

  future: {
    v4: true,
  },

  // Production URL — served under unified docs domain (Cloudflare Pages + Worker router).
  // See infra/docs-router in the byte8.io monorepo + docs/DOCS_SITE_MIGRATION.md.
  url: 'https://docs.byte8.io',
  baseUrl: '/horizon/',
  trailingSlash: false,

  onBrokenLinks: 'warn',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
          editUrl:
            'https://github.com/byte8io/docs-horizon/edit/main/',
        },
        blog: {
          showReadingTime: true,
          blogTitle: 'Changelog & updates',
          blogDescription: 'Release notes for Byte8 Horizon',
          postsPerPage: 10,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl:
            'https://github.com/byte8io/docs-horizon/edit/main/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  // Capture-phase click interceptor that forces same-tab navigation for DocSearch
  // hits pointing at sibling docs.byte8.io sites. See the module for the SEO/UX
  // rationale (replaces externalUrlRegex).
  clientModules: ['./src/clientModules/fix-docsearch-nav.ts'],

  themeConfig: {
    image: 'img/social-card.png',
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'Byte8 Horizon',
      logo: {
        alt: 'Byte8 Horizon',
        src: 'img/logo.svg',
        srcDark: 'img/logo.svg',
        width: 32,
        height: 32,
      },
      items: [
        {
          href: 'https://docs.byte8.io/',
          label: '← All docs',
          position: 'left',
          target: '_self',
          rel: null,
        },
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        { to: '/blog', label: 'Changelog', position: 'left' },
        {
          href: 'https://byte8.io/products/horizon#pricing',
          label: 'Pricing',
          position: 'left',
        },
        {
          href: 'https://github.com/byte8io/module-horizon',
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'Horizon Magento extension on GitHub',
        },
        {
          href: 'https://horizon.byte8.io',
          label: 'Dashboard',
          position: 'right',
          className: 'navbar-cta-button',
        },
      ],
    },
    footer: {
      style: 'dark',
      logo: {
        alt: 'Byte8',
        src: 'img/logo.svg',
        href: 'https://byte8.io',
        width: 32,
        height: 32,
      },
      links: [
        {
          title: 'Docs',
          items: [
            { label: 'Quick start', to: '/docs/getting-started/quick-start' },
            { label: 'Install the extension', to: '/docs/magento-extension/install' },
            { label: 'Connect Claude', to: '/docs/mcp/connecting-claude' },
            { label: 'MCP tools', to: '/docs/mcp/tools' },
          ],
        },
        {
          title: 'Resources',
          items: [
            { label: 'Changelog', to: '/blog' },
            { label: 'Dashboard', href: 'https://horizon.byte8.io' },
            { label: 'Pricing', href: 'https://byte8.io/products/horizon#pricing' },
            { label: 'module-horizon on GitHub', href: 'https://github.com/byte8io/module-horizon' },
          ],
        },
        {
          title: 'Byte8',
          items: [
            { label: 'byte8.io', href: 'https://byte8.io' },
            { label: 'Horizon product', href: 'https://byte8.io/products/horizon' },
            { label: 'Pulsar (monitoring)', href: 'https://docs.byte8.io/pulsar/' },
            { label: 'Orbit (zero-downtime deploys)', href: 'https://docs.byte8.io/orbit/' },
            { label: 'Contact', href: 'mailto:helo@byte8.io' },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} Byte8 Ltd.`,
    },
    prism: {
      theme: prismThemes.vsDark,
      darkTheme: prismThemes.vsDark,
      additionalLanguages: ['bash', 'json', 'yaml', 'toml', 'nginx', 'rust', 'php', 'graphql', 'diff'],
    },
    // Algolia DocSearch — cross-product search across every docs.byte8.io/* site.
    // Public Search-Only credentials (designed to ship in client JS, restricted to
    // read-only queries on this index). Safe to commit.
    algolia: {
      appId: 'VWO679B1LI',
      apiKey: 'b3f3b5b76b0d684e50796c9e045b41e5',
      indexName: 'Byte8 Documentation Site',
      contextualSearch: false,
      searchPagePath: 'search',
      // Cross-site navigation handled by src/clientModules/fix-docsearch-nav.ts —
      // intentionally NOT using externalUrlRegex (which would make Docusaurus's
      // <Link> emit absolute URLs with target="_blank", hurting internal-link SEO).
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
