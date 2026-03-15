import { Badge } from "./ui/badge";

const classes = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  hidden: "border-slate-200 bg-slate-100 text-slate-700",
};

export default function StatusBadge({ status }) {
  return (
    <Badge className={classes[status] || classes.pending}>
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Pending"}
    </Badge>
  );
}
