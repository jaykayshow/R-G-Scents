import { NotesPyramid } from "@/types";

export function NotesPyramidDisplay({ notes }: { notes: NotesPyramid }) {
  const tiers: { label: string; items: string[] }[] = [
    { label: "Top Notes", items: notes.top },
    { label: "Middle Notes", items: notes.middle },
    { label: "Base Notes", items: notes.base },
  ];

  return (
    <div className="space-y-6">
      {tiers.map((tier, i) => (
        <div key={tier.label} className="flex gap-4">
          <div className="flex w-10 shrink-0 flex-col items-center">
            <span className="font-serif text-lg text-gold">{i + 1}</span>
            <span className="mt-1 h-full w-px bg-white/15" />
          </div>
          <div className="pb-2">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-gold">{tier.label}</h4>
            <p className="mt-1.5 text-sm text-white/70">{tier.items.join(", ")}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
