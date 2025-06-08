'use client';

import React, { useState } from 'react';
import { PersonaAssistant } from '@/components/ui/persona-assistant';
import { AssistantResponse } from '@/lib/types/assistant';

export default function PersonaAssistantDemo() {
  const [language, setLanguage] = useState<'he' | 'en' | 'ar'>('he');
  const [conversationData, setConversationData] = useState<any[]>([]);

  const handleMessageSent = (message: string, response: AssistantResponse) => {
    setConversationData(prev => [
      ...prev,
      {
        userMessage: message,
        assistantResponse: response,
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {language === 'he'
              ? 'הדגמת יועץ התכשיטים האישי'
              : language === 'ar'
                ? 'عرض مستشار المجوهرات الشخصي'
                : 'Personal Jewelry Assistant Demo'}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {language === 'he'
              ? 'התנסה עם יועץ התכשיטים הבינה המלאכותית שלנו. בחר אישיות שמתאימה לך ותחל לחקור עולם התכשיטים.'
              : language === 'ar'
                ? 'جرب مستشار المجوهرات بالذكاء الاصطناعي. اختر شخصية تناسبك وابدأ في استكشاف عالم المجوهرات.'
                : 'Experience our AI jewelry consultant. Choose a persona that suits you and start exploring the world of jewelry.'}
          </p>
        </div>

        {/* Language selector */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-lg p-2 shadow-sm border">
            <div className="flex gap-2">
              <button
                onClick={() => setLanguage('he')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  language === 'he' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                עברית
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  language === 'en' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('ar')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  language === 'ar' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                العربية
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main chat interface */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <PersonaAssistant language={language} onMessageSent={handleMessageSent} />
            </div>
          </div>

          {/* Side panel with insights */}
          <div className="space-y-6">
            {/* Persona descriptions */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">
                {language === 'he'
                  ? 'אישיויות היועץ'
                  : language === 'ar'
                    ? 'شخصيات المستشار'
                    : 'Assistant Personas'}
              </h3>
              <div className="space-y-4 text-sm">
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-medium">
                    {language === 'he'
                      ? 'חוקר המתנות'
                      : language === 'ar'
                        ? 'مستكشف الهدايا'
                        : 'Gift Explorer'}
                  </h4>
                  <p className="text-gray-600">
                    {language === 'he'
                      ? 'מתמחה במציאת המתנה המושלמת לאנשים מיוחדים'
                      : language === 'ar'
                        ? 'متخصص في العثور على الهدية المثالية للأشخاص المميزين'
                        : 'Specializes in finding the perfect gift for special people'}
                  </p>
                </div>

                <div className="border-l-4 border-pink-500 pl-4">
                  <h4 className="font-medium">
                    {language === 'he'
                      ? 'הנותן הרומנטי'
                      : language === 'ar'
                        ? 'المانح الرومانسي'
                        : 'Romantic Giver'}
                  </h4>
                  <p className="text-gray-600">
                    {language === 'he'
                      ? 'עוזר ליצור תכשיטים שמבטאים אהבה עמוקה'
                      : language === 'ar'
                        ? 'يساعد في إنشاء مجوهرات تعبر عن الحب العميق'
                        : 'Helps create jewelry that expresses deep love'}
                  </p>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-medium">
                    {language === 'he'
                      ? 'הקונה המבטא עצמיות'
                      : language === 'ar'
                        ? 'المشتري المعبر عن الذات'
                        : 'Self-Expressive Buyer'}
                  </h4>
                  <p className="text-gray-600">
                    {language === 'he'
                      ? 'מתמחה בתכשיטים שמבטאים אישיות ייחודית'
                      : language === 'ar'
                        ? 'متخصص في المجوهرات التي تعبر عن الشخصية الفريدة'
                        : 'Specializes in jewelry that expresses unique personality'}
                  </p>
                </div>
              </div>
            </div>

            {/* Conversation insights */}
            {conversationData.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {language === 'he'
                    ? 'תובנות מהשיחה'
                    : language === 'ar'
                      ? 'رؤى من المحادثة'
                      : 'Conversation Insights'}
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {language === 'he' ? 'הודעות:' : language === 'ar' ? 'الرسائل:' : 'Messages:'}
                    </span>
                    <span className="font-medium">{conversationData.length}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {language === 'he'
                        ? 'אמון ממוצע:'
                        : language === 'ar'
                          ? 'الثقة المتوسطة:'
                          : 'Avg Confidence:'}
                    </span>
                    <span className="font-medium">
                      {conversationData.length > 0
                        ? Math.round(
                            (conversationData.reduce(
                              (sum, item) =>
                                sum + (item.assistantResponse.metadata.confidence || 0),
                              0
                            ) /
                              conversationData.length) *
                              100
                          ) + '%'
                        : '0%'}
                    </span>
                  </div>

                  {conversationData.length > 0 && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">
                        {language === 'he'
                          ? 'הודעה אחרונה:'
                          : language === 'ar'
                            ? 'آخر رسالة:'
                            : 'Latest Response:'}
                      </h4>
                      <p className="text-gray-600 text-xs">
                        {conversationData[
                          conversationData.length - 1
                        ].assistantResponse.content.substring(0, 100)}
                        ...
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>
            {language === 'he'
              ? 'יועץ התכשיטים מופעל על ידי OpenAI GPT-4o ומותאם לשוק הישראלי והערבי'
              : language === 'ar'
                ? 'مستشار المجوهرات مدعوم بـ OpenAI GPT-4o ومُخصص للسوق الإسرائيلي والعربي'
                : 'Jewelry consultant powered by OpenAI GPT-4o, tailored for Israeli and Arabic markets'}
          </p>
        </div>
      </div>
    </div>
  );
}
