import { PageHeader } from '../components/admin/ui'
import { IconPencil } from '../components/icons'
import { inventoryItems, stockToneClass } from '../data/store'

export function InventoryPage() {
  return (
    <div className="animate-fade-up px-8 py-8 lg:px-10">
      <PageHeader
        title="Inventory"
        subtitle="Track stock across size & colour variants"
      />

      <div className="mt-6 max-w-2xl rounded-xl bg-attention-bg px-4 py-3 text-[0.9rem] font-medium text-burgundy">
        {inventoryItems.length} variants need attention
      </div>

      <ul className="mt-5 flex max-w-2xl flex-col gap-2.5">
        {inventoryItems.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-3.5 shadow-sm"
          >
            <span className="min-w-[6.5rem] font-medium text-admin-ink">{item.label}</span>
            <span className="flex-1 text-[0.85rem] text-muted-light">{item.sku}</span>
            <span className={`w-8 text-right font-semibold ${stockToneClass(item.stock)}`}>
              {item.stock}
            </span>
            <button
              type="button"
              className="rounded-md p-1.5 text-sidebar-active transition hover:bg-accent-pink"
              aria-label={`Edit ${item.label}`}
            >
              <IconPencil className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
