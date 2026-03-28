'use client';

interface PlaceholderSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function PlaceholderSection({ title, description, icon }: PlaceholderSectionProps) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-6">
          {icon}
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">{title}</h2>
        <p className="text-slate-600 dark:text-slate-400">{description}</p>
        <button className="mt-6 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors">
          Coming Soon
        </button>
      </div>
    </div>
  );
}
