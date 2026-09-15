import { useFlash } from '../context/FlashContext.jsx';

export default function FlashMessages() {
  const { messages, dismiss } = useFlash();
  if (!messages.length) return null;

  return (
    <div>
      {messages.map((m) => (
        <div key={m.id} className={`alert alert-${m.type} app-alert d-flex justify-content-between align-items-center`} role="alert">
          <span>{m.text}</span>
          <button type="button" className="btn-close btn-close-white btn-sm" onClick={() => dismiss(m.id)} aria-label="Dismiss" />
        </div>
      ))}
    </div>
  );
}
