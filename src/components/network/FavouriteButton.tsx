import type { MouseEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { Vendor } from '../../types'
import { useApp } from '../../store/AppContext'

// Planners save vendors to their dashboard. Signed out, the heart goes to sign-up and comes back here;
// vendor and admin accounts have no favourites, so they don't get one.
export function FavouriteButton({
  vendor,
  variant = 'overlay',
  className = '',
}: {
  vendor: Vendor
  variant?: 'overlay' | 'outline'
  className?: string
}) {
  const { user, isFavourite, toggleFavourite } = useApp()
  const nav = useNavigate()
  const { pathname, search } = useLocation()
  if (user && user.role !== 'customer') return null
  const saved = !!user && isFavourite(vendor.id)

  const onClick = (e: MouseEvent) => {
    // the heart sits inside cards that are links or buttons themselves
    e.preventDefault()
    e.stopPropagation()
    if (user) toggleFavourite(vendor.id)
    else nav(`/signup?next=${encodeURIComponent(pathname + search)}`)
  }

  const look =
    variant === 'overlay'
      ? 'h-9 w-9 bg-paper/90 shadow-sm hover:bg-paper'
      : `h-10 w-10 border ${saved ? 'border-danger/40' : 'border-ink/20'} hover:border-ink`
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={saved ? `remove ${vendor.name} from favourites` : `save ${vendor.name}`}
      title={saved ? 'saved to favourites' : user ? 'save to favourites' : 'sign up to save'}
      className={`flex shrink-0 items-center justify-center rounded-full transition-colors ${look} ${saved ? 'text-danger' : 'text-ink'} ${className}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 7.9 3.6 4.5 7 4.5c2 0 3.5 1.1 5 3 1.5-1.9 3-3 5-3 3.4 0 5.6 3.4 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2Z" />
      </svg>
    </button>
  )
}
