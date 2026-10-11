import { GovernmentService } from '../api';

const CATEGORY_ICON_MAP: Record<string, string> = {
  'citizen services': '🏛️',
  certificates: '📄',
  transport: '🚗',
  education: '🎓',
  scholarships: '🎓',
  welfare: '🤝',
  'social security': '🛡️',
  'land records': '🗺️',
  housing: '🏠',
  utilities: '💡',
  'digital services': '💻',
  identity: '🪪',
  agriculture: '🌾',
  business: '📈',
  compliance: '📑',
  finance: '💰',
  health: '🩺',
  vaccination: '💉',
  travel: '🧳',
  labour: '🛠️',
  engagement: '🗳️'
};

const getCategoryIcon = (categories: string[]): string => {
  for (const category of categories) {
    const icon = CATEGORY_ICON_MAP[category.toLowerCase()];
    if (icon) {
      return icon;
    }
  }

  return '🔗';
};

type ServiceCardProps = {
  service: GovernmentService;
  emphasis?: boolean;
  badge?: string;
  note?: string;
};

export const ServiceCard = ({ service, emphasis = false, badge, note }: ServiceCardProps) => {
  const officialLinks = service.relatedLinks.slice(0, 3);
  const guideVideos = service.guideVideos.slice(0, 2);
  const icon = getCategoryIcon(service.categories);

  return (
    <article className={`service-card${emphasis ? ' service-card--emphasis' : ''}`}>
      <header className="service-card__header">
        <span className="service-card__icon" aria-hidden="true">
          {icon}
        </span>
        <div className="service-card__summary">
          <p className="service-card__state">{service.state}</p>
          <h3>{service.name}</h3>
          {badge ? <span className="service-card__badge">{badge}</span> : null}
        </div>
      </header>
      <p className="service-card__description">{service.description}</p>
      {service.department ? <p className="service-card__meta">{service.department}</p> : null}
      {note ? <p className="service-card__note">{note}</p> : null}
      <div className="service-card__tags" aria-label="Service categories">
        {service.categories.map((category) => (
          <span key={category} className="service-card__tag">
            {category}
          </span>
        ))}
      </div>

      {officialLinks.length ? (
        <div className="service-card__links-group" role="group" aria-label="Official resources">
          <p className="service-card__links-title">Official resources</p>
          <div className="service-card__links-list">
            {officialLinks.map((link) => (
              <a
                key={link.url}
                className="service-card__secondary"
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      ) : null}

      {guideVideos.length ? (
        <div className="service-card__links-group" role="group" aria-label="Help videos">
          <p className="service-card__links-title">How-to videos</p>
          <div className="service-card__links-list">
            {guideVideos.map((guide) => (
              <a
                key={guide.url}
                className="service-card__secondary service-card__secondary--guide"
                href={guide.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {guide.label}
              </a>
            ))}
          </div>
        </div>
      ) : null}

      <footer className="service-card__footer">
        <a
          className="service-card__action"
          href={service.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${service.name} portal for ${service.state}`}
        >
          Open official portal
        </a>
        <span className="service-card__footnote">Verified link ↗</span>
      </footer>
    </article>
  );
};
