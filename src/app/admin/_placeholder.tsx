export default function AdminPlaceholder({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
