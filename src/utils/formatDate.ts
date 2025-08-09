export function formatDate(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");

  const dd = pad(d.getDate());
  const MM = pad(d.getMonth() + 1);
  const yyyy = d.getFullYear();
  const HH = pad(d.getHours());
  const mm = pad(d.getMinutes());

  return `${dd}.${MM}.${yyyy} ${HH}:${mm}`;
}
