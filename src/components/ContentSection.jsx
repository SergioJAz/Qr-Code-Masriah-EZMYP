/**
 * One section of the document: a heading, its paragraphs, and optionally a
 * list of sub-parts (used here for the mysteries of the rosary).
 *
 * `body` accepts a single string or an array of strings (one per paragraph).
 * `heading` is optional — pass "" for an untitled section.
 */
function Paragraphs({ body }) {
  const paragraphs = Array.isArray(body) ? body : [body];

  return paragraphs.map((paragraph, index) => (
    <p className="section__body" key={index}>
      {paragraph}
    </p>
  ));
}

export default function ContentSection({ id, heading, body, items }) {
  return (
    <section className="section" id={id}>
      {heading ? <h2 className="section__heading">{heading}</h2> : null}
      <Paragraphs body={body} />

      {items?.map((item, index) => (
        <div className="subsection" key={item.heading || index}>
          {item.heading ? <h3 className="subsection__heading">{item.heading}</h3> : null}
          <Paragraphs body={item.body} />
        </div>
      ))}
    </section>
  );
}
