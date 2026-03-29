import React from 'react';
import { motion } from 'framer-motion';
import { Check, RotateCcw, Info } from 'lucide-react';
import { cn } from '../lib/utils';

interface Step {
  id: string;
  name: string;
  note?: string;
}

interface HorizontalStepperProps {
  steps: Step[];
  currentStepId: string;
  isVetoed?: boolean;
}

export const HorizontalStepper: React.FC<HorizontalStepperProps> = ({ 
  steps, 
  currentStepId, 
  isVetoed 
}) => {
  const currentIndex = steps.findIndex(s => s.id === currentStepId);

  return (
    <div className="relative w-full py-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          
          return (
            <div key={step.id} className="relative flex flex-1 flex-col items-center group">
              {/* Connector Line */}
              {index !== 0 && (
                <div 
                  className={cn(
                    "absolute left-[-50%] top-5 h-0.5 w-full transition-colors duration-500",
                    isCompleted ? "bg-gold" : "bg-zinc-200"
                  )}
                />
              )}

              {/* Step Circle */}
              <div 
                className={cn(
                  "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                  isCompleted ? "bg-gold border-gold text-white" : 
                  isCurrent ? "bg-white border-gold text-gold gold-glow" : 
                  "bg-white border-zinc-200 text-zinc-400"
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : isVetoed && isCurrent ? (
                  <RotateCcw className="h-5 w-5 animate-pulse" />
                ) : (
                  <span className="text-sm font-bold">{index + 1}</span>
                )}

                {/* Tooltip */}
                {step.note && (
                  <div className="absolute bottom-full mb-4 hidden group-hover:block z-50">
                    <div className="glass-card rounded-xl p-3 shadow-2xl ring-1 ring-gold/20 w-48">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                        <p className="text-[10px] leading-relaxed text-navy font-medium">
                          {step.note}
                        </p>
                      </div>
                      <div className="absolute left-1/2 top-full -translate-x-1/2 border-8 border-transparent border-t-white/80" />
                    </div>
                  </div>
                )}
              </div>

              {/* Label */}
              <div className="mt-4 text-center">
                <p className={cn(
                  "text-[10px] font-bold uppercase tracking-widest transition-colors",
                  isCurrent ? "text-gold" : "text-zinc-400"
                )}>
                  {step.name}
                </p>
                {isVetoed && isCurrent && (
                  <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[8px] font-black text-red-600 uppercase tracking-tighter">
                    <RotateCcw className="h-2 w-2" /> Vetoed
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
