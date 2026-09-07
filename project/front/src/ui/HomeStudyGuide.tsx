import guide from '../data/homeStudyGuide.json';

export function HomeStudyGuide() {
  return (
    <section className="home-about" aria-labelledby="home-about-heading">
      <h2 id="home-about-heading" className="home-about__title">
        {guide.title}
      </h2>
      <p className="legal-updated">
        更新日: <time dateTime={guide.updated}>{guide.updated}</time>
      </p>
      <p className="home-about__lead">{guide.introduction}</p>
      {guide.sections.map((section) => (
        <div key={section.heading}>
          <h3 className="home-about__subtitle">{section.heading}</h3>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph} className="home-about__lead">
              {paragraph}
            </p>
          ))}
          {section.points.length > 0 && (
            <ul className="legal-list">
              {section.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          )}
          {section.links.length > 0 && (
            <ul className="legal-list">
              {section.links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="home-about__link">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
      <p className="home-about__lead">{guide.siteSummary}</p>
      <ul className="legal-list">
        {guide.siteLinks.map((link) => (
          <li key={link.href}>
            <a href={link.href} className="home-about__link">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
