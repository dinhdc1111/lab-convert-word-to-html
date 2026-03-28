import { FileText } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between shrink-0 z-50">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <FileText className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">DocToHTML</span>
        </div>
      </div>
    </header>
  );
}
