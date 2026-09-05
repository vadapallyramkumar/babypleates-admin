export const homeFieldClass =
  'w-full rounded-lg border border-border bg-white px-3 py-2.5 text-[0.9rem] text-admin-ink outline-none transition placeholder:text-muted-light focus:border-burgundy/40 focus:ring-2 focus:ring-burgundy/15'

export const homeLabelClass = 'text-[0.8rem] font-medium text-admin-ink'

export type HomeSection = 'heroes' | 'promos' | 'trending'

export function homeSectionPath(section: HomeSection): string {
  if (section === 'heroes') return '/home?tab=heroes'
  if (section === 'promos') return '/home?tab=promos'
  return '/home?tab=trending'
}

export function parseHomeTab(value: string | null): HomeSection {
  if (value === 'promos' || value === 'trending' || value === 'heroes') return value
  // Legacy tab id from when trending used platform social links
  if (value === 'social') return 'trending'
  return 'heroes'
}
