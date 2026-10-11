import { Link } from 'react-router-dom';

export const LandingPage = () => {
  return (
    <main className="page">
      <section className="hero">
        <h1>Seva Navigator</h1>
        <p>
          A single search window to reach official state government portals across India without visiting a MeeSeva
          centre.
        </p>
        <ul className="hero__list">
          <li>Browse trusted links for your state in seconds.</li>
          <li>Find certificates, welfare schemes, and transport services.</li>
          <li>Jump straight to the government domain for applications.</li>
        </ul>
        <Link className="primary" to="/dashboard">
          Open citizen portal
        </Link>
      </section>
    </main>
  );
};
