import { DressLogo, FloralDecoration, IconBox, IconImage, IconSettings } from '../icons'

const features = [
  {
    title: 'Products & Inventory',
    description: 'Add, edit and manage your products and stock.',
    Icon: IconBox,
  },
  {
    title: 'Media & Collections',
    description: 'Organize images, categories and collections.',
    Icon: IconImage,
  },
  {
    title: 'Store & Settings',
    description: 'Manage store preferences, policies and more.',
    Icon: IconSettings,
  },
] as const

export function BrandPanel() {
  return (
    <aside className="relative flex flex-col overflow-hidden bg-pink-panel px-8 py-10 sm:px-10 sm:py-12 lg:w-[42%] lg:min-h-full lg:rounded-l-[1.75rem] lg:rounded-r-none">
      {/* Soft watercolor wash */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 20% 15%, rgba(255,255,255,0.55), transparent 55%), radial-gradient(ellipse 70% 60% at 90% 80%, rgba(232,196,189,0.8), transparent 50%), linear-gradient(165deg, #f7e0db 0%, #f0cfc9 45%, #e9c2bb 100%)',
        }}
      />

      <div className="relative z-10 flex flex-1 flex-col animate-fade-in">
        <div className="flex flex-col items-center text-center">
          <DressLogo className="mb-3 h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem]" />
          <h1 className="font-display text-[1.85rem] font-semibold tracking-[0.04em] text-burgundy sm:text-[2.15rem]">
            BABY PLEATES
          </h1>
          <div className="my-2.5 flex w-40 items-center gap-2 sm:w-48">
            <span className="h-px flex-1 bg-burgundy/30" />
            <span className="text-[0.65rem] text-burgundy" aria-hidden="true">
              ♥
            </span>
            <span className="h-px flex-1 bg-burgundy/30" />
          </div>
          <p className="text-[0.7rem] font-medium tracking-[0.28em] text-burgundy uppercase">
            Admin Studio
          </p>
        </div>

        <p className="mt-8 max-w-[17rem] self-center text-center text-[0.9rem] leading-relaxed text-burgundy/80 sm:max-w-[18.5rem]">
          Manage your products, collections, media and content — all in one place.
        </p>

        <ul className="mt-9 flex flex-col gap-5">
          {features.map(({ title, description, Icon }) => (
            <li key={title} className="flex items-start gap-3.5">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-icon text-burgundy shadow-sm">
                <Icon className="h-[1.15rem] w-[1.15rem]" />
              </span>
              <div>
                <p className="text-[0.92rem] font-semibold text-burgundy">{title}</p>
                <p className="mt-0.5 text-[0.8rem] leading-snug text-burgundy/70">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <FloralDecoration className="pointer-events-none absolute -right-2 -bottom-4 h-40 w-48 opacity-90 sm:h-44 sm:w-52" />
    </aside>
  )
}
