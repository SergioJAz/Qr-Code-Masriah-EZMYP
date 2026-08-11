/**
 * Jump links to each section. Worth having on a long document — it saves a
 * lot of scrolling on a phone. Hidden from the printed PDF, where page
 * numbers, not links, are what matter.
 *
 * `entries` is [{ id, heading }]. Renders nothing if there is nothing to list.
 */
export default function TableOfContents({ label, entries }) {
  if (!entries?.length) return null;

  return (
    <nav className="contents" aria-label={label}>
      {label ? <h2 className="contents__label">{label}</h2> : null}
      <ol className="contents__list">
        {entries.map(({ id, heading }) => (
          <li key={id}>
            <a className="contents__link" href={`#${id}`}>
              {heading}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
