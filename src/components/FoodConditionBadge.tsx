import React from 'react';
import { Utensils, Clock, AlertCircle, Apple } from 'lucide-react';
import { FoodCondition, LanguageCode } from '../types';
import { translations } from '../utils/translations';

interface Props {
  condition: FoodCondition;
  language: LanguageCode;
  showExplanation?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const FoodConditionBadge: React.FC<Props> = ({
  condition,
  language,
  showExplanation = false,
  size = 'md'
}) => {
  const t = translations[language] || translations.en;
  const config = t.foodConditions[condition] || t.foodConditions.anytime;

  const styleMap: Record<FoodCondition, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
    before_food: {
      bg: 'bg-amber-50',
      text: 'text-amber-900',
      border: 'border-amber-300',
      icon: <Apple className="w-4 h-4 text-amber-700 shrink-0" />
    },
    after_food: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-900',
      border: 'border-emerald-300',
      icon: <Utensils className="w-4 h-4 text-emerald-700 shrink-0" />
    },
    with_food: {
      bg: 'bg-sky-50',
      text: 'text-sky-900',
      border: 'border-sky-300',
      icon: <Utensils className="w-4 h-4 text-sky-700 shrink-0" />
    },
    anytime: {
      bg: 'bg-slate-100',
      text: 'text-slate-800',
      border: 'border-slate-300',
      icon: <Clock className="w-4 h-4 text-slate-600 shrink-0" />
    }
  };

  const style = styleMap[condition];

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-sm px-3 py-1.5 gap-2',
    lg: 'text-base px-4 py-2 gap-2.5 font-medium'
  }[size];

  return (
    <div className="flex flex-col gap-1">
      <span
        id={`food-badge-${condition}`}
        className={`inline-flex items-center rounded-full border font-medium ${style.bg} ${style.text} ${style.border} ${sizeClasses}`}
      >
        {style.icon}
        <span className="font-semibold whitespace-nowrap">{config.title}</span>
      </span>
      {showExplanation && (
        <p className="text-xs text-slate-600 flex items-start gap-1 mt-0.5 max-w-sm">
          <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <span>{config.hint}</span>
        </p>
      )}
    </div>
  );
};
