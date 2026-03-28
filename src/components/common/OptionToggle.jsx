import { Check } from 'lucide-react';

export default function OptionToggle({ label, description, checked, onChange }) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-3 cursor-pointer group">
        <div 
          onClick={onChange}
          className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${
            checked ? "bg-blue-600 border-blue-600" : "bg-white border-slate-300 group-hover:border-blue-400"
          }`}
        >
          {checked && <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />}
        </div>
        <span className={`text-sm font-semibold transition-colors ${checked ? "text-slate-900" : "text-slate-600 group-hover:text-slate-900"}`}>
          {label}
        </span>
      </label>
      <p className="text-xs text-slate-500 ml-8 leading-relaxed">{description}</p>
    </div>
  );
}
