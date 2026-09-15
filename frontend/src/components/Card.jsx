/** The standard panel used across every module page. */
export default function Card({ title, icon, actions, footer, bodyClassName = '', children }) {
  return (
    <div className="app-card">
      {(title || actions) && (
        <div className="app-card-header d-flex flex-wrap gap-2 justify-content-between align-items-center">
          <h5 className="mb-0">
            {icon && <i className={`bi ${icon} me-2`} />}
            {title}
          </h5>
          {actions && <div className="d-flex flex-wrap gap-2">{actions}</div>}
        </div>
      )}
      <div className={`app-card-body ${bodyClassName}`}>{children}</div>
      {footer && <div className="app-card-footer">{footer}</div>}
    </div>
  );
}
