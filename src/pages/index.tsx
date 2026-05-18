import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import styles from './index.module.css';

interface FeatureCardProps {
  href: string;
  icon: string;
  title: string;
  body: string;
  cta: string;
}

function FeatureCard({ href, icon, title, body, cta }: FeatureCardProps) {
  return (
    <Link to={href} className={styles.featureCard}>
      <span className={styles.featureIcon} aria-hidden>{icon}</span>
      <h3 className={styles.featureTitle}>{title}</h3>
      <p className={styles.featureBody}>{body}</p>
      <span className={styles.featureFooter}>{cta} ↘</span>
    </Link>
  );
}

export default function Home(): React.ReactElement {
  return (
    <Layout
      title="Byte8 Horizon — MCP gateway for Magento 2 catalogs"
      description="Make your Magento 2 storefront discoverable to Claude, ChatGPT, and every AI agent that speaks the Model Context Protocol. Hosted gateway, thin Magento extension, real-time catalog access."
    >
      <main>
        {/* Hero */}
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <span className={styles.eyebrow}>Magento 2 · MCP · AEO — Answer Engine Optimization</span>
            <h1 className={styles.heroTitle}>
              Your catalog, visible to{' '}
              <span className={styles.heroTitleAccent}>every AI.</span>
            </h1>
            <p className={styles.heroSubtitle}>
              A hosted Model Context Protocol gateway in front of your Magento 2 store.
              Claude, ChatGPT, and any agent that speaks MCP can search products, read
              inventory, and quote prices in real time. Install a thin extension, paste
              the API key, you're live.
            </p>
            <div className={styles.heroCtas}>
              <Link className="button button--primary button--lg" to="/docs/getting-started/quick-start">
                Quick start
              </Link>
              <Link className="button button--secondary button--lg" to="/docs/">
                Read the docs
              </Link>
            </div>

            <div className={styles.statsRow}>
              <div className={styles.stat}>
                <span className={styles.statValue}>8</span>
                <span className={styles.statLabel}>MCP tools out of the box</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>0</span>
                <span className={styles.statLabel}>Long-lived services to run</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>&lt; 5 min</span>
                <span className={styles.statLabel}>Install to first MCP call</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>Soft</span>
                <span className={styles.statLabel}>Caps + overage, never 429</span>
              </div>
            </div>
          </div>
        </section>

        {/* MCP surface */}
        <section className={styles.section}>
          <header className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>MCP surface</span>
            <p className={styles.sectionLead}>
              An ecommerce-shaped tool surface, not a thin wrapper over Magento REST.
              Every response is AI-consumable — flat, denormalised, context-friendly.
            </p>
          </header>

          <div className={styles.cardGrid}>
            <FeatureCard
              href="/docs/mcp/tools"
              icon="🛍️"
              title="Catalog tools"
              body="search_products with category/type/stock filters. get_product returns full detail — description, tiered pricing, images, breadcrumbs, attributes. get_categories walks the tree with depth control."
              cta="Browse tools"
            />
            <FeatureCard
              href="/docs/mcp/tools"
              icon="📦"
              title="Inventory & orders"
              body="get_inventory reads MSI source stock, get_orders + get_order let agents look up status, line items, and shipments — every call scoped to the merchant's store API key."
              cta="Inventory tools"
            />
            <FeatureCard
              href="/docs/mcp/connecting-claude"
              icon="🤖"
              title="Wire up Claude in minutes"
              body="One Streamable HTTP endpoint at /mcp. Drop your API key into Claude Desktop, the Anthropic SDK, or any MCP-aware agent framework. We handle the protocol; you keep selling."
              cta="Connect Claude"
            />
          </div>
        </section>

        {/* Architecture */}
        <section className={styles.section}>
          <header className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Architecture</span>
            <p className={styles.sectionLead}>
              A thin Magento extension plus a Byte8-hosted gateway. Outbound-only from
              your store, no public webhook to expose, no model hosting to manage.
            </p>
          </header>

          <div className={styles.cardGrid}>
            <FeatureCard
              href="/docs/magento-extension/install"
              icon="🧩"
              title="Thin Magento extension"
              body="byte8/module-horizon ships a flat AI-index table (not EAV joins), a /horizon/* REST mount, and an indexer that rebuilds on product save. Install Composer-style, paste the API key, done."
              cta="Install the extension"
            />
            <FeatureCard
              href="/docs/mcp/overview"
              icon="🛰️"
              title="Hosted MCP gateway"
              body="Streamable HTTP transport via rmcp. Per-tenant isolation by user_id. Every tool invocation logged for analytics and overage billing. No long-lived service for you to keep alive."
              cta="Gateway overview"
            />
            <FeatureCard
              href="/docs/stores/api-keys"
              icon="🔑"
              title="Per-store API keys"
              body="Each connected store gets its own key, hashed at rest, rotatable from the dashboard. Lose it? Rotate and the old one is dead. The cleartext is shown to you exactly once."
              cta="Manage keys"
            />
          </div>
        </section>

        {/* CTA band */}
        <section className={styles.ctaBand}>
          <h2 className={styles.ctaTitle}>SEO bought you Google. AEO buys you everywhere else.</h2>
          <p className={styles.ctaSubtitle}>
            Install the Magento extension · add a store at <code>horizon.byte8.io</code> · point Claude at <code>/mcp</code>.
          </p>
          <div className={styles.heroCtas}>
            <Link className="button button--primary button--lg" to="/docs/getting-started/quick-start">
              Quick start
            </Link>
            <Link className="button button--secondary button--lg" to="https://byte8.io/products/horizon">
              Plans & pricing
            </Link>
          </div>
        </section>
      </main>
    </Layout>
  );
}
