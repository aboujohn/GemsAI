'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DirectionalContainer } from '@/components/ui/DirectionalContainer';
import { DirectionalFlex } from '@/components/ui/DirectionalFlex';
import { Icons } from '@/components/ui/Icons';
import { Badge } from '@/components/ui/badge';
import { ShippingAddress, BillingAddress, ShippingMethod } from '@/lib/types/cart';

interface CheckoutShippingProps {
  onContinue: (shipping: ShippingAddress, billing: BillingAddress, method: ShippingMethod) => void;
  onBack: () => void;
}

interface ShippingFormData extends ShippingAddress {
  sameAsShipping: boolean;
  billingFirstName?: string;
  billingLastName?: string;
  billingCompany?: string;
  billingAddress1?: string;
  billingAddress2?: string;
  billingCity?: string;
  billingState?: string;
  billingPostalCode?: string;
  billingCountry?: string;
  billingPhone?: string;
}

const COUNTRIES = [
  { value: 'IL', label: 'Israel', code: '+972' },
  { value: 'US', label: 'United States', code: '+1' },
  { value: 'GB', label: 'United Kingdom', code: '+44' },
  { value: 'DE', label: 'Germany', code: '+49' },
  { value: 'FR', label: 'France', code: '+33' },
  { value: 'CA', label: 'Canada', code: '+1' },
  { value: 'AU', label: 'Australia', code: '+61' },
];

const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: 'standard',
    name: 'Standard Shipping',
    description: '5-7 business days',
    cost: 50,
    estimatedDays: 7,
    carrier: 'Israel Post',
  },
  {
    id: 'express',
    name: 'Express Shipping',
    description: '2-3 business days',
    cost: 120,
    estimatedDays: 3,
    carrier: 'DHL Express',
  },
  {
    id: 'overnight',
    name: 'Overnight Shipping',
    description: 'Next business day',
    cost: 250,
    estimatedDays: 1,
    carrier: 'FedEx Overnight',
  },
];

export function CheckoutShipping({ onContinue, onBack }: CheckoutShippingProps) {
  const { t, formatCurrency } = useTranslation();
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<ShippingMethod>(SHIPPING_METHODS[0]);
  const [sameAsShipping, setSameAsShipping] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ShippingFormData>({
    defaultValues: {
      country: 'IL',
      sameAsShipping: true,
      billingCountry: 'IL',
    },
  });

  const watchedSameAsShipping = watch('sameAsShipping');

  const onSubmit = (data: ShippingFormData) => {
    const shippingAddress: ShippingAddress = {
      firstName: data.firstName,
      lastName: data.lastName,
      company: data.company,
      address1: data.address1,
      address2: data.address2,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      country: data.country,
      phone: data.phone,
    };

    const billingAddress: BillingAddress = {
      sameAsShipping: data.sameAsShipping,
      firstName: data.sameAsShipping ? data.firstName : data.billingFirstName || '',
      lastName: data.sameAsShipping ? data.lastName : data.billingLastName || '',
      company: data.sameAsShipping ? data.company : data.billingCompany,
      address1: data.sameAsShipping ? data.address1 : data.billingAddress1 || '',
      address2: data.sameAsShipping ? data.address2 : data.billingAddress2,
      city: data.sameAsShipping ? data.city : data.billingCity || '',
      state: data.sameAsShipping ? data.state : data.billingState || '',
      postalCode: data.sameAsShipping ? data.postalCode : data.billingPostalCode || '',
      country: data.sameAsShipping ? data.country : data.billingCountry || 'IL',
      phone: data.sameAsShipping ? data.phone : data.billingPhone,
    };

    onContinue(shippingAddress, billingAddress, selectedShippingMethod);
  };

  return (
    <DirectionalContainer className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Shipping Address */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {t('checkout.shipping.address.title')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('checkout.shipping.address.firstName')} *
              </label>
              <Input
                {...register('firstName', { required: 'First name is required' })}
                error={errors.firstName?.message}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('checkout.shipping.address.lastName')} *
              </label>
              <Input
                {...register('lastName', { required: 'Last name is required' })}
                error={errors.lastName?.message}
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('checkout.shipping.address.company')}
              </label>
              <Input {...register('company')} />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('checkout.shipping.address.address1')} *
              </label>
              <Input
                {...register('address1', { required: 'Address is required' })}
                error={errors.address1?.message}
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('checkout.shipping.address.address2')}
              </label>
              <Input {...register('address2')} />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('checkout.shipping.address.city')} *
              </label>
              <Input
                {...register('city', { required: 'City is required' })}
                error={errors.city?.message}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('checkout.shipping.address.state')} *
              </label>
              <Input
                {...register('state', { required: 'State is required' })}
                error={errors.state?.message}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('checkout.shipping.address.postalCode')} *
              </label>
              <Input
                {...register('postalCode', { required: 'Postal code is required' })}
                error={errors.postalCode?.message}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('checkout.shipping.address.country')} *
              </label>
              <Select {...register('country', { required: 'Country is required' })}>
                {COUNTRIES.map((country) => (
                  <option key={country.value} value={country.value}>
                    {country.label}
                  </option>
                ))}
              </Select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('checkout.shipping.address.phone')}
              </label>
              <Input {...register('phone')} type="tel" />
            </div>
          </div>
        </Card>

        {/* Billing Address */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {t('checkout.shipping.billing.title')}
          </h2>
          
          <div className="mb-4">
            <Checkbox
              {...register('sameAsShipping')}
              checked={watchedSameAsShipping}
              onCheckedChange={(checked) => setSameAsShipping(checked as boolean)}
            />
            <label className="ml-2 text-sm text-gray-700">
              {t('checkout.shipping.billing.sameAsShipping')}
            </label>
          </div>

          {!watchedSameAsShipping && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('checkout.shipping.address.firstName')} *
                </label>
                <Input
                  {...register('billingFirstName', { 
                    required: !watchedSameAsShipping ? 'First name is required' : false 
                  })}
                  error={errors.billingFirstName?.message}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('checkout.shipping.address.lastName')} *
                </label>
                <Input
                  {...register('billingLastName', { 
                    required: !watchedSameAsShipping ? 'Last name is required' : false 
                  })}
                  error={errors.billingLastName?.message}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('checkout.shipping.address.company')}
                </label>
                <Input {...register('billingCompany')} />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('checkout.shipping.address.address1')} *
                </label>
                <Input
                  {...register('billingAddress1', { 
                    required: !watchedSameAsShipping ? 'Address is required' : false 
                  })}
                  error={errors.billingAddress1?.message}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('checkout.shipping.address.address2')}
                </label>
                <Input {...register('billingAddress2')} />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('checkout.shipping.address.city')} *
                </label>
                <Input
                  {...register('billingCity', { 
                    required: !watchedSameAsShipping ? 'City is required' : false 
                  })}
                  error={errors.billingCity?.message}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('checkout.shipping.address.state')} *
                </label>
                <Input
                  {...register('billingState', { 
                    required: !watchedSameAsShipping ? 'State is required' : false 
                  })}
                  error={errors.billingState?.message}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('checkout.shipping.address.postalCode')} *
                </label>
                <Input
                  {...register('billingPostalCode', { 
                    required: !watchedSameAsShipping ? 'Postal code is required' : false 
                  })}
                  error={errors.billingPostalCode?.message}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('checkout.shipping.address.country')} *
                </label>
                <Select {...register('billingCountry')}>
                  {COUNTRIES.map((country) => (
                    <option key={country.value} value={country.value}>
                      {country.label}
                    </option>
                  ))}
                </Select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('checkout.shipping.address.phone')}
                </label>
                <Input {...register('billingPhone')} type="tel" />
              </div>
            </div>
          )}
        </Card>

        {/* Shipping Methods */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {t('checkout.shipping.methods.title')}
          </h2>
          
          <div className="space-y-4">
            {SHIPPING_METHODS.map((method) => (
              <div
                key={method.id}
                className={`
                  p-4 border rounded-lg cursor-pointer transition-colors
                  ${selectedShippingMethod.id === method.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
                onClick={() => setSelectedShippingMethod(method)}
              >
                <DirectionalFlex className="justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div
                      className={`
                        w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${selectedShippingMethod.id === method.id
                          ? 'border-blue-500'
                          : 'border-gray-300'
                        }
                      `}
                    >
                      {selectedShippingMethod.id === method.id && (
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-900">{method.name}</h3>
                      <p className="text-sm text-gray-600">{method.description}</p>
                      <p className="text-xs text-gray-500">{method.carrier}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      {method.cost === 0 ? (
                        <Badge variant="secondary">Free</Badge>
                      ) : (
                        formatCurrency(method.cost, 'ILS')
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {method.estimatedDays} {method.estimatedDays === 1 ? 'day' : 'days'}
                    </div>
                  </div>
                </DirectionalFlex>
              </div>
            ))}
          </div>
        </Card>

        {/* Action Buttons */}
        <Card className="p-6">
          <DirectionalFlex className="justify-between items-center">
            <Button variant="outline" onClick={onBack} type="button">
              <Icons.ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.actions.back')}
            </Button>
            
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-2">
                Shipping: {formatCurrency(selectedShippingMethod.cost, 'ILS')}
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Icons.Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('common.loading')}
                  </>
                ) : (
                  <>
                    {t('common.actions.continue')}
                    <Icons.ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </DirectionalFlex>
        </Card>
      </form>
    </DirectionalContainer>
  );
}