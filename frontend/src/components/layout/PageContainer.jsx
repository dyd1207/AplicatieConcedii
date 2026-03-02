export default function PageContainer({ title, children }) {
  return (
    <div className="container py-4">
      {title && <h2 className="text-app-primary mb-3">{title}</h2>}
      {children}
    </div>
  );
}