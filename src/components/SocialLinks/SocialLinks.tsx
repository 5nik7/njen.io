import { profile } from '../../data/profile'
import type { SocialId } from '../../data/profile'
import './social-links.css'

function Icon({ id }: { id: SocialId }) {
  if (id === 'github') return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .75a11.25 11.25 0 0 0-3.56 21.922c.562.104.769-.244.769-.542 0-.267-.01-.975-.015-1.913-3.13.68-3.791-1.508-3.791-1.508-.512-1.3-1.25-1.646-1.25-1.646-1.021-.698.078-.684.078-.684 1.13.08 1.725 1.16 1.725 1.16 1.004 1.722 2.635 1.225 3.277.937.102-.729.393-1.226.715-1.508-2.499-.284-5.126-1.25-5.126-5.564 0-1.229.439-2.233 1.16-3.02-.116-.285-.503-1.429.11-2.977 0 0 .945-.303 3.094 1.153a10.78 10.78 0 0 1 5.628 0c2.148-1.456 3.092-1.153 3.092-1.153.615 1.548.228 2.692.112 2.977.722.787 1.158 1.791 1.158 3.02 0 4.325-2.631 5.277-5.139 5.555.404.349.766 1.036.766 2.088 0 1.508-.014 2.724-.014 3.094 0 .3.203.652.774.542A11.252 11.252 0 0 0 12 .75Z" /></svg>
  )
  if (id === 'linkedin') return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 2H3.55A1.53 1.53 0 0 0 2 3.51v16.98A1.53 1.53 0 0 0 3.55 22h16.9A1.53 1.53 0 0 0 22 20.49V3.51A1.53 1.53 0 0 0 20.45 2ZM7.93 18.75H4.98V9.2h2.95ZM6.46 7.9a1.71 1.71 0 1 1 0-3.42 1.71 1.71 0 0 1 0 3.42Zm12.29 10.85H15.8V14.1c0-1.1-.02-2.52-1.54-2.52-1.54 0-1.78 1.2-1.78 2.44v4.73H9.53V9.2h2.83v1.3h.04a3.1 3.1 0 0 1 2.79-1.53c2.99 0 3.55 1.97 3.55 4.53Z" /></svg>
  )
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
}

export function SocialLinks() {
  return (
    <nav className="social-links" aria-label="Connect with Nick">
      {profile.links.map(({ id, label, href }) => (
        <a key={id} className={`social-link social-link--${id}`} href={href} target={id === 'email' ? undefined : '_blank'} rel={id === 'email' ? undefined : 'noopener noreferrer'} aria-label={label} title={label}>
          <Icon id={id} />
        </a>
      ))}
    </nav>
  )
}
