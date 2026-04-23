import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion, useReducedMotion } from "framer-motion";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Card({ children, className, role }: { children: React.ReactNode; className?: string; role?: string }) {
  return (
    <div 
      role={role}
      className={cn("bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm", className)}
    >
      {children}
    </div>
  );
}

export function MotionCard({ children, className, ...props }: any) {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <motion.div
      whileHover={shouldReduceMotion ? {} : { y: -5, scale: 1.02, rotateX: 2, rotateY: 2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn("bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'danger' }) {
  const styles = {
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  };
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider", styles[variant])}>
      {children}
    </span>
  );
}

export function Button({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button 
      className={cn(
        "px-6 py-2.5 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
        "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none dark:focus-visible:ring-offset-slate-950",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-transparent",
        "focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-0 transition-all outline-none",
        "text-slate-900 dark:text-white placeholder:text-slate-400",
        className
      )}
      {...props}
    />
  );
}
