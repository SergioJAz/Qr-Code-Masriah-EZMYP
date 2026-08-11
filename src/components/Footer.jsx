/**
 * Small print at the bottom. Renders nothing when `text` is empty.
 */
export default function Footer({ text }) {
  if (!text) return null;

  return (
    <footer className="footer">
      <p>{text}</p>
    </footer>
  );
}
