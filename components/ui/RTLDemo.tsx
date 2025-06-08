'use client';

import React, { useState } from 'react';
import { DirectionalContainer } from './DirectionalContainer';
import { DirectionalFlex } from './DirectionalFlex';
import { DirectionalInput } from './DirectionalInput';
import { Button } from './Button';
import { Card } from './Card';
import { LanguageSwitcher } from './LanguageSwitcher';
import {
  useRTL,
  useRTLClasses,
  useLayoutDirection,
  useIconRotation,
  useBidiContent,
  useFormDirection,
} from '@/lib/hooks/useRTL';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, Search } from 'lucide-react';

/**
 * Comprehensive demonstration of RTL layout switching capabilities
 */
export function RTLDemo() {
  const { isRTL, direction } = useRTL();
  const rtlClasses = useRTLClasses();
  const layout = useLayoutDirection();
  const { t } = useTranslation();
  const bidi = useBidiContent();
  const form = useFormDirection();

  const [inputValue, setInputValue] = useState('');
  const [emailValue, setEmailValue] = useState('test@example.com');
  const [numberValue, setNumberValue] = useState('123.45');

  // Icon rotation hooks
  const chevronRotation = useIconRotation('chevron');
  const arrowRotation = useIconRotation('arrow');

  return (
    <div className="space-y-8 p-6">
      <DirectionalContainer className="space-y-4" alignText>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            {t('formatting.rtl_demo_title', 'RTL Layout Demo')}
          </h1>
          <LanguageSwitcher />
        </div>

        <p className="text-muted-foreground">
          {t(
            'formatting.rtl_demo_description',
            'This demo showcases automatic RTL/LTR layout switching based on language selection.'
          )}
        </p>
      </DirectionalContainer>

      {/* Direction Information */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">
          {t('formatting.direction_info', 'Direction Information')}
        </h2>
        <DirectionalFlex gap="md" wrap>
          <div className="bg-secondary p-3 rounded-md">
            <strong>Current Language:</strong> {direction === 'rtl' ? 'Hebrew' : 'English'}
          </div>
          <div className="bg-secondary p-3 rounded-md">
            <strong>Direction:</strong> {direction.toUpperCase()}
          </div>
          <div className="bg-secondary p-3 rounded-md">
            <strong>Is RTL:</strong> {isRTL ? 'Yes' : 'No'}
          </div>
        </DirectionalFlex>
      </Card>

      {/* Flex Layout Demo */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">
          {t('formatting.flex_layout_demo', 'Flex Layout Demo')}
        </h2>

        <div className="space-y-4">
          <DirectionalFlex justify="start" gap="md">
            <Button variant="default">First</Button>
            <Button variant="secondary">Second</Button>
            <Button variant="outline">Third</Button>
          </DirectionalFlex>

          <DirectionalFlex justify="between" gap="md">
            <span>Start</span>
            <span>Middle</span>
            <span>End</span>
          </DirectionalFlex>

          <DirectionalFlex justify="end" gap="sm">
            <Button size="sm" variant="ghost">
              <ChevronLeft className={chevronRotation} />
              Previous
            </Button>
            <Button size="sm" variant="ghost">
              Next
              <ChevronRight className={chevronRotation} />
            </Button>
          </DirectionalFlex>
        </div>
      </Card>

      {/* Icon Direction Demo */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">
          {t('formatting.icon_direction_demo', 'Icon Direction Demo')}
        </h2>

        <DirectionalFlex gap="md" wrap>
          <Button variant="outline">
            <ArrowLeft className={arrowRotation} />
            {t('actions.back', 'Back')}
          </Button>
          <Button variant="outline">
            {t('actions.forward', 'Forward')}
            <ArrowRight className={arrowRotation} />
          </Button>
          <Button variant="outline">
            <Search />
            {t('actions.search', 'Search')}
          </Button>
        </DirectionalFlex>
      </Card>

      {/* Form Elements Demo */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">
          {t('formatting.form_elements_demo', 'Form Elements Demo')}
        </h2>

        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${form.labelAlign}`}>
              {t('formatting.text_input', 'Text Input')} (
              {t('formatting.follows_ui_direction', 'Follows UI Direction')})
            </label>
            <DirectionalInput
              inputType="text"
              placeholder={t('formatting.enter_text', 'Enter text here...')}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${form.labelAlign}`}>
              {t('formatting.email_input', 'Email Input')} (
              {t('formatting.always_ltr', 'Always LTR')})
            </label>
            <DirectionalInput
              inputType="email"
              contentDirection="ltr"
              value={emailValue}
              onChange={e => setEmailValue(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${form.labelAlign}`}>
              {t('formatting.number_input', 'Number Input')} (
              {t('formatting.numeric_alignment', 'Numeric Alignment')})
            </label>
            <DirectionalInput
              inputType="number"
              value={numberValue}
              onChange={e => setNumberValue(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </Card>

      {/* Mixed Content Demo */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">
          {t('formatting.mixed_content_demo', 'Mixed Content Demo')}
        </h2>

        <div className="space-y-4">
          <div className="p-3 bg-secondary rounded-md">
            <h3 className="font-medium mb-2">{t('formatting.regular_text', 'Regular Text')}</h3>
            <p>
              {isRTL
                ? 'זהו טקסט בעברית עם מילים באנגלית כמו Email ו-JavaScript שמעורבות בתוכן.'
                : 'This is English text with Hebrew words like שלום and תכשיטים mixed in the content.'}
            </p>
          </div>

          <div className="p-3 bg-secondary rounded-md">
            <h3 className="font-medium mb-2">
              {t('formatting.isolated_content', 'Isolated Content')}
            </h3>
            <p className="bidi-isolate">
              {isRTL
                ? bidi.isolate('מייל: user@domain.com, טלפון: +972-50-1234567')
                : bidi.isolate('Email: user@domain.com, Phone: +972-50-1234567')}
            </p>
          </div>
        </div>
      </Card>

      {/* Spacing Demo */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">
          {t('formatting.spacing_demo', 'Spacing Demo')}
        </h2>

        <DirectionalContainer
          spacing={{
            paddingStart: '1rem',
            paddingEnd: '2rem',
            marginStart: '0.5rem',
            marginEnd: '1rem',
          }}
          className="bg-secondary rounded-md"
        >
          <p>
            {t(
              'formatting.spacing_example',
              'This container has different start/end padding and margins that automatically adjust for RTL.'
            )}
          </p>
        </DirectionalContainer>
      </Card>

      {/* CSS Classes Demo */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">
          {t('formatting.css_classes_demo', 'CSS Classes Demo')}
        </h2>

        <div className="space-y-4">
          <div className={`p-3 rounded-md ${layout.textStart} bg-secondary`}>
            <strong>Text Start:</strong>{' '}
            {t(
              'formatting.aligned_to_start',
              'This text is aligned to the start of the container.'
            )}
          </div>

          <div className={`p-3 rounded-md ${layout.textEnd} bg-secondary`}>
            <strong>Text End:</strong>{' '}
            {t('formatting.aligned_to_end', 'This text is aligned to the end of the container.')}
          </div>

          <DirectionalFlex className="p-3 rounded-md bg-secondary" justify="between">
            <span className={layout.floatStart}>Float Start</span>
            <span className={layout.floatEnd}>Float End</span>
          </DirectionalFlex>
        </div>
      </Card>

      {/* Animation Demo */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">
          {t('formatting.animation_demo', 'Animation Demo')}
        </h2>

        <div className="space-y-4">
          <DirectionalFlex gap="md">
            <Button variant="outline" className="animate-slide-in-left">
              Slide In Left
            </Button>
            <Button variant="outline" className="animate-slide-in-right">
              Slide In Right
            </Button>
          </DirectionalFlex>

          <p className="text-sm text-muted-foreground">
            {t(
              'formatting.animation_note',
              'Animations automatically adjust direction in RTL mode.'
            )}
          </p>
        </div>
      </Card>
    </div>
  );
}
