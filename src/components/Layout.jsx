/**
 * Page shell: centers the content column and caps its reading width.
 * Layout only — no content lives here.
 */
export default function Layout({ children }) {
  return <div className="page">{children}</div>;
}
