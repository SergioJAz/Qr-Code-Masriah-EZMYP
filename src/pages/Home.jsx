import { pageContent } from '../content/pageContent.js';
import Layout from '../components/Layout.jsx';
import Header from '../components/Header.jsx';
import TableOfContents from '../components/TableOfContents.jsx';
import ContentSection from '../components/ContentSection.jsx';
import Footer from '../components/Footer.jsx';

export default function Home() {
  const {
    title,
    subtitle,
    lastUpdated,
    lastUpdatedLabel,
    showLogo,
    logoAlt,
    showContents,
    contentsLabel,
    sections,
    footer,
    pdfUrl,
    pdfLabel,
  } = pageContent;

  // Numbered ids rather than slugs of the headings: they stay valid whatever
  // language the content is written in, and keep the URL free of escapes.
  const entries = sections.map((section, index) => ({
    id: `section-${index + 1}`,
    heading: section.heading,
  }));

  // On GitHub Pages the site lives under /<repo>/, so a root-relative link
  // like '/document.pdf' would miss. BASE_URL is '/' everywhere else.
  const pdfHref = pdfUrl?.startsWith('/')
    ? `${import.meta.env.BASE_URL.replace(/\/$/, '')}${pdfUrl}`
    : pdfUrl;

  return (
    <Layout>
      <Header
        title={title}
        subtitle={subtitle}
        lastUpdated={lastUpdated}
        lastUpdatedLabel={lastUpdatedLabel}
        showLogo={showLogo}
        logoAlt={logoAlt}
      />

      {pdfUrl ? (
        <p className="actions">
          <a className="button" href={pdfHref} download>
            {pdfLabel || 'Download PDF'}
          </a>
        </p>
      ) : null}

      {showContents ? <TableOfContents label={contentsLabel} entries={entries} /> : null}

      <main id="content">
        {sections.map((section, index) => (
          <ContentSection
            key={entries[index].id}
            id={entries[index].id}
            heading={section.heading}
            body={section.body}
            items={section.items}
          />
        ))}
      </main>

      <Footer text={footer} />
    </Layout>
  );
}
