'use client';

import React from 'react';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { DirectionalFlex } from '@/components/ui/DirectionalFlex';
import { Icons } from '@/components/ui/Icons';
import { CheckoutState } from '@/lib/types/cart';

interface CheckoutProgressProps {
  currentStep: CheckoutState['step'];
}

export function CheckoutProgress({ currentStep }: CheckoutProgressProps) {
  const { t } = useTranslation();

  const steps = [
    { id: 'cart', label: t('checkout.steps.cart'), icon: Icons.ShoppingBag },
    { id: 'shipping', label: t('checkout.steps.shipping'), icon: Icons.Truck },
    { id: 'payment', label: t('checkout.steps.payment'), icon: Icons.CreditCard },
    { id: 'confirmation', label: t('checkout.steps.confirmation'), icon: Icons.CheckCircle },
  ] as const;

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className="w-full py-6">
      <DirectionalFlex className="justify-between items-center">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isUpcoming = index > currentStepIndex;

          return (
            <React.Fragment key={step.id}>
              {/* Step */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors
                    ${isCompleted 
                      ? 'bg-green-500 text-white' 
                      : isCurrent 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-400'
                    }
                  `}
                >
                  {isCompleted ? (
                    <Icons.Check className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={`
                    text-sm font-medium text-center
                    ${isCurrent 
                      ? 'text-blue-600' 
                      : isCompleted 
                        ? 'text-green-600' 
                        : 'text-gray-400'
                    }
                  `}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    flex-1 h-0.5 mx-4 transition-colors
                    ${index < currentStepIndex 
                      ? 'bg-green-500' 
                      : 'bg-gray-200'
                    }
                  `}
                />
              )}
            </React.Fragment>
          );
        })}
      </DirectionalFlex>
    </div>
  );
}