import intro from '../data/pageIntro.json';

/**
 * トップの導入（サイトの目的・対象者・学習の進め方）。
 * 文言は pageIntro.json を静的HTML（scripts/prerender.mjs）と共有する。
 */
export function HomeIntro() {
  const home = intro.home;
  return (
    <section className="home-intro" aria-label="このサイトの使い方">
      <p className="home-intro__lead">{home.lead}</p>
      <ul className="home-intro__actions">
        {home.actions.map((action) => (
          <li key={action.href}>
            <a href={action.href} className="home-intro__action">
              {action.label}
            </a>
          </li>
        ))}
      </ul>
      <h2 className="home-intro__heading">{home.audienceHeading}</h2>
      <ul className="home-intro__list">
        {home.audience.map((text) => (
          <li key={text}>{text}</li>
        ))}
      </ul>
      <h2 id="home-intro-steps" className="home-intro__heading">
        {home.stepsHeading}
      </h2>
      <ol className="home-intro__steps">
        {home.steps.map((step) => (
          <li key={step.label} className="home-intro__step">
            <span className="home-intro__step-label">{step.label}</span>{' '}
            <span className="home-intro__step-text">{step.text}</span>{' '}
            <a href={step.href} className="home-about__link">
              {step.linkLabel}
            </a>
          </li>
        ))}
      </ol>
      <p className="home-intro__note">{home.note}</p>
    </section>
  );
}
