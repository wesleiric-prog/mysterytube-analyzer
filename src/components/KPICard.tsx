import React from 'react';
import { motion } from 'motion/react';
import * as Lucide from 'lucide-react';

interface KPICardProps {
  id: string;
  title: string;
  value: string | number;
  icon: keyof typeof Lucide;
  description: string;
  accent?: 'red' | 'amber' | 'blue' | 'emerald';
}

export default function KPICard({ id, title, value, icon, description, accent = 'red' }: KPICardProps) {
  const IconComponent = Lucide[icon] as React.ComponentType<{ className?: string }>;

  const accentLines = {
    red: 'from-transparent via-red-600 to-transparent',
    amber: 'from-transparent via-amber-500 to-transparent',
    blue: 'from-transparent via-sky-500 to-transparent',
    emerald: 'from-transparent via-emerald-500 to-transparent',
  };

  const accentIcons = {
    red: 'text-red-500',
    amber: 'text-amber-500',
    blue: 'text-sky-500',
    emerald: 'text-emerald-500',
  };

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4, transition: { duration: 0.1 } }}
      className="relative p-6 rounded-2xl border border-white/5 bg-zinc-900/40 shadow-lg shadow-black/40 backdrop-blur-sm transition-all hover:border-red-900/30 overflow-hidden flex flex-col justify-between"
    >
      <div className={`absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r ${accentLines[accent]} opacity-40`}></div>
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-[0.15em] font-sans font-medium text-gray-400">{title}</span>
          <div className="text-3xl font-bold font-display tracking-tight mt-1 px-0 text-white">
            {value}
          </div>
        </div>
        <div className={`p-2.5 rounded-lg bg-white/5 border border-white/5 ${accentIcons[accent]}`}>
          {IconComponent && <IconComponent className="w-5 h-5 stroke-[1.5]" />}
        </div>
      </div>
      <p className="text-[11px] text-gray-500 mt-4 leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}
