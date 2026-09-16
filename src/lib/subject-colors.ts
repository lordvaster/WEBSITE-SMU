const COLORS = [
  "bg-blue-50 border-blue-200 text-blue-700",
  "bg-green-50 border-green-200 text-green-700",
  "bg-amber-50 border-amber-200 text-amber-700",
  "bg-purple-50 border-purple-200 text-purple-700",
  "bg-pink-50 border-pink-200 text-pink-700",
  "bg-teal-50 border-teal-200 text-teal-700",
];

export function colorForSubject(mapel: string): string {
  let hash = 0;
  for (let i = 0; i < mapel.length; i++) hash = (hash + mapel.charCodeAt(i)) % COLORS.length;
  return COLORS[hash];
}
