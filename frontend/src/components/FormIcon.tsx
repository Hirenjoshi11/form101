import React from 'react';
import {
  IndianRupee,
  Award,
  Users,
  MapPin,
  Car,
  GraduationCap,
  FileText,
  BadgePercent,
  Landmark,
  CreditCard,
  Stethoscope,
} from 'lucide-react';

interface FormIconProps {
  slug: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const getFormTheme = (slug: string) => {
  switch (slug) {
    case 'income_certificate':
      return {
        icon: IndianRupee,
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-700',
        gradient: 'from-blue-600 to-indigo-700',
        badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
        accentColor: '#2563eb',
      };
    case 'ews_certificate':
      return {
        icon: BadgePercent,
        bgColor: 'bg-amber-100',
        textColor: 'text-amber-700',
        gradient: 'from-amber-500 to-orange-600',
        badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
        accentColor: '#f59e0b',
      };
    case 'caste_ncl_certificate':
      return {
        icon: Users,
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-700',
        gradient: 'from-purple-600 to-indigo-700',
        badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
        accentColor: '#7c3aed',
      };
    case 'land_records_7_12':
      return {
        icon: MapPin,
        bgColor: 'bg-cyan-100',
        textColor: 'text-cyan-700',
        gradient: 'from-cyan-600 to-blue-700',
        badgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
        accentColor: '#0891b2',
      };
    case 'driving_licence_rto':
      return {
        icon: Car,
        bgColor: 'bg-sky-100',
        textColor: 'text-sky-700',
        gradient: 'from-sky-600 to-blue-700',
        badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
        accentColor: '#0284c7',
      };
    case 'neet_exam':
      return {
        icon: GraduationCap,
        bgColor: 'bg-rose-100',
        textColor: 'text-rose-700',
        gradient: 'from-rose-600 to-red-700',
        badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
        accentColor: '#e11d48',
      };
    default:
      return {
        icon: FileText,
        bgColor: 'bg-slate-100',
        textColor: 'text-slate-700',
        gradient: 'from-slate-600 to-slate-800',
        badgeBg: 'bg-slate-50 text-slate-700 border-slate-200',
        accentColor: '#475569',
      };
  }
};

export const FormIcon: React.FC<FormIconProps> = ({ slug, className = 'w-6 h-6', size = 'md' }) => {
  const theme = getFormTheme(slug);
  const IconComponent = theme.icon;

  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-12 h-12 rounded-xl',
    lg: 'w-16 h-16 rounded-2xl',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div
      className={`${sizeClasses[size]} ${theme.bgColor} ${theme.textColor} flex items-center justify-center transition-all duration-300 shadow-sm`}
    >
      <IconComponent className={className || iconSizes[size]} />
    </div>
  );
};
