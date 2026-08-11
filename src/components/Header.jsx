import logo from '../assets/logo.png';

/**
 * Title block at the top of the page.
 * Logo, subtitle and lastUpdated are all optional.
 */
export default function Header({ title, subtitle, lastUpdated, lastUpdatedLabel, showLogo, logoAlt }) {
  return (
    <header className="header">
      {showLogo ? <img className="header__logo" src={logo} alt={logoAlt || ''} /> : null}
      <h1 className="header__title">{title}</h1>
      {subtitle ? <p className="header__subtitle">{subtitle}</p> : null}
      {lastUpdated ? (
        <p className="header__meta">
          {lastUpdatedLabel ? `${lastUpdatedLabel}: ` : ''}
          {lastUpdated}
        </p>
      ) : null}
    </header>
  );
}
