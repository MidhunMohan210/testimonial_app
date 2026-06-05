import { Input } from "../ui/input";
import { Label } from "../ui/label";

export default function BusinessProfileSettings({ register, errors, slug }) {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-4">
        <div className="space-y-2">
          <Label htmlFor="settings-name">Business Name</Label>
          <Input
            id="settings-name"
            className="h-12 rounded-lg border-slate-200 bg-white"
            {...register("name", {
              required: "Business name is required",
              validate: (value) =>
                value.trim().length > 0 || "Business name is required",
            })}
          />
          {errors.name ? <p className="text-sm text-red-600">{errors.name.message}</p> : null}
        </div>
      </div>

      <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-4">
        <div className="space-y-2">
          <Label htmlFor="settings-slug">Slug</Label>
          <Input
            id="settings-slug"
            value={slug}
            readOnly
            className="h-12 rounded-lg border-slate-200 bg-white text-slate-500"
          />
        </div>
      </div>
    </div>
  );
}
