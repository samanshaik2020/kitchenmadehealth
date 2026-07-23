import type { LucideIcon } from "lucide-react";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  action?: React.ReactNode;
}) {
  return (
    <header className="grid gap-6 border-b border-line pb-8 md:grid-cols-[1fr_auto] md:items-end">
      <div>
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-full bg-terracotta/10 text-terracotta">
            <Icon size={16} />
          </span>
          <p className="eyebrow text-terracotta">{eyebrow}</p>
        </div>
        <h1 className="mt-4 font-display text-5xl font-medium tracking-[-.055em] md:text-6xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-stone">{description}</p>
      </div>
      {action}
    </header>
  );
}
