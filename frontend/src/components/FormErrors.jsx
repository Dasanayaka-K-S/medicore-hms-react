/** Renders validation errors returned by the API above a form. */
export default function FormErrors({ errors }) {
  if (!errors || !errors.length) return null;
  return (
    <div>
      {errors.map((err, i) => (
        <div key={i} className="alert alert-danger app-alert">{err}</div>
      ))}
    </div>
  );
}
