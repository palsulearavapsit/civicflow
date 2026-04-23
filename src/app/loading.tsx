export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-indigo-400 rounded-full animate-spin [animation-duration:1.5s]"></div>
        </div>
        <div className="space-y-2 text-center">
          <p className="font-black text-xl tracking-tight text-slate-900 dark:text-white animate-pulse">CivicFlow</p>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Optimizing your experience...</p>
        </div>
      </div>
    </div>
  );
}
