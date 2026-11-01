// A colored circle with the company's first letter. The hue is derived from
// the name, so each company keeps the same color.
export default function Avatar({ name, size = 36 }) {
  let hash = 0
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) % 360

  return (
    <span
      className="avatar"
      style={{ '--hue': hash, width: size, height: size, fontSize: size * 0.42 }}
      aria-hidden="true"
    >
      {name.trim().charAt(0).toUpperCase() || '?'}
    </span>
  )
}
