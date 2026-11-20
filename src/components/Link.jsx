import { navigate } from '../helpers/router'

/** Anchor SPA: tetap berupa <a href> (dapat dicrawl) tetapi tidak me-reload halaman. */
export default function Link({ to, children, onClick, ...props }) {
  const handleClick = (event) => {
    if (onClick) onClick(event)
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return
    event.preventDefault()
    navigate(to)
  }
  return (
    <a href={to} onClick={handleClick} {...props}>
      {children}
    </a>
  )
}
