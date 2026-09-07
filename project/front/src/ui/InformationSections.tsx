interface InformationSection {
  heading: string;
  paragraphs: string[];
  points: string[];
  links: { label: string; href: string }[];
}

export function InformationSections({ sections }: { sections: InformationSection[] }) {
  return sections.map((section) => (
    <section key={section.heading} className="legal-section">
      <h2 className="legal-section__title">{section.heading}</h2>
      {section.paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
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
              <a
                href={link.href}
                className="legal-link"
                target={link.href.startsWith('https://') ? '_blank' : undefined}
                rel={link.href.startsWith('https://') ? 'noopener noreferrer' : undefined}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  ));
}
