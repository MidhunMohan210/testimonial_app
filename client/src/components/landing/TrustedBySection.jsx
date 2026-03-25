import {
  BriefcaseBusiness,
  Clapperboard,
  GraduationCap,
  Scissors,
  Stethoscope,
  UtensilsCrossed,
} from "lucide-react";

const audience = [
  { name: "Agencies", icon: BriefcaseBusiness },
  { name: "Clinics", icon: Stethoscope },
  { name: "Restaurants", icon: UtensilsCrossed },
  { name: "Salons", icon: Scissors },
  { name: "Coaches", icon: GraduationCap },
  { name: "Creators", icon: Clapperboard },
];

export default function TrustedBySection() {
  return (
    <div className="mt-20 flex w-full max-w-6xl flex-col items-center">
      <p className="text-sm font-medium text-slate-400 sm:text-base">
        Built for service businesses that rely on trust
      </p>
      <div className="mt-6 flex w-full flex-wrap items-center justify-center gap-3 sm:gap-4">
        {audience.map(({ name, icon: Icon }) => (
          <span
            key={name}
            className="inline-flex items-center gap-2 rounded-full bg-white/75 px-4 py-2 text-sm font-semibold text-slate-500 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.3)] backdrop-blur"
          >
            <Icon className="h-4 w-4 text-slate-400" />
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}
