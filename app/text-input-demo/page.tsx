'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Type, Languages, FileText, Keyboard, Globe, CheckCircle } from 'lucide-react';
import RichTextEditor from '@/components/forms/RichTextEditor';
import TextStoryInput, { type StoryMetadata } from '@/components/forms/TextStoryInput';
import { cn } from '@/lib/utils';

export default function TextInputDemoPage() {
  const { t } = useTranslation(['common', 'story']);

  // State for demo components
  const [richTextContent, setRichTextContent] = useState('');
  const [storyContent, setStoryContent] = useState('');
  const [submissions, setSubmissions] = useState<
    Array<{
      content: string;
      metadata: StoryMetadata;
      timestamp: number;
    }>
  >([]);

  // Handle story submission
  const handleStorySubmit = (content: string, metadata: StoryMetadata) => {
    setSubmissions(prev => [
      {
        content,
        metadata,
        timestamp: Date.now(),
      },
      ...prev,
    ]);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Type className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">
            {t('common:nav.textInputDemo', 'RTL Text Input Demo')}
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t(
            'textInputDemo.description',
            'Comprehensive text input interfaces with full RTL language support, automatic language detection, and rich formatting capabilities for GemsAI story capture.'
          )}
        </p>

        {/* Feature badges */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Badge variant="secondary" className="gap-1">
            <Languages className="h-3 w-3" />
            Hebrew & Arabic RTL
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Globe className="h-3 w-3" />
            Auto Language Detection
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Keyboard className="h-3 w-3" />
            Rich Text Formatting
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <FileText className="h-3 w-3" />
            Story Validation
          </Badge>
        </div>
      </div>

      {/* Main Demo Tabs */}
      <Tabs defaultValue="story-input" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="story-input" className="gap-2">
            <FileText className="h-4 w-4" />
            Story Input
          </TabsTrigger>
          <TabsTrigger value="rich-editor" className="gap-2">
            <Type className="h-4 w-4" />
            Rich Text Editor
          </TabsTrigger>
          <TabsTrigger value="submissions" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Submissions ({submissions.length})
          </TabsTrigger>
        </TabsList>

        {/* Story Input Demo */}
        <TabsContent value="story-input" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Story Input Interface
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Complete story input component with RTL support, language detection, validation, and
                submission handling.
              </p>
            </CardHeader>
            <CardContent>
              <TextStoryInput
                value={storyContent}
                onChange={(content, metadata) => {
                  setStoryContent(content);
                  console.log('Story content updated:', { content, metadata });
                }}
                onSubmit={handleStorySubmit}
                placeholder="כתבו את הסיפור שמאחורי התכשיט המיוחד שלכם..."
                maxLength={2000}
                minLength={30}
                required
                autoFocus
              />
            </CardContent>
          </Card>

          {/* RTL Examples */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-right" dir="rtl">
                  דוגמאות בעברית
                </CardTitle>
                <p className="text-sm text-muted-foreground text-right" dir="rtl">
                  דוגמאות לטקסט בעברית עם תמיכה מלאה ב-RTL
                </p>
              </CardHeader>
              <CardContent className="space-y-4" dir="rtl">
                <div className="text-right space-y-2">
                  <h4 className="font-medium">סיפור על טבעת אירוסין:</h4>
                  <p className="text-sm text-muted-foreground">
                    "זהו הסיפור על הטבעת שקיבלתי מסבתא שלי. הטבעת הזאת עברה דרך שלושה דורות של נשים
                    חזקות במשפחה שלנו, כל אחת הוסיפה לה את הקסם והאהבה שלה..."
                  </p>
                </div>
                <Separator />
                <div className="text-right space-y-2">
                  <h4 className="font-medium">תכשיט עם משמעות תרבותית:</h4>
                  <p className="text-sm text-muted-foreground">
                    "הצמיד הזה מייצג את הקשר שלי למורשת הספרדית שלי. כל חרוז מספר חלק מהסיפור של
                    המשפחה, מהימים בספרד ועד ההגירה לארץ החדשה..."
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-right" dir="rtl">
                  دمو باللغة العربية
                </CardTitle>
                <p className="text-sm text-muted-foreground text-right" dir="rtl">
                  أمثلة على النصوص العربية مع دعم كامل للاتجاه من اليمين إلى اليسار
                </p>
              </CardHeader>
              <CardContent className="space-y-4" dir="rtl">
                <div className="text-right space-y-2">
                  <h4 className="font-medium">قصة عن قلادة عائلية:</h4>
                  <p className="text-sm text-muted-foreground">
                    "هذه القلادة الذهبية كانت ملك جدتي، وقد ورثتها من والدتها. كل حبة لؤلؤ فيها تحمل
                    ذكرى من ذكريات العائلة، وكل نقش يحكي قصة من قصص الحب والأمل..."
                  </p>
                </div>
                <Separator />
                <div className="text-right space-y-2">
                  <h4 className="font-medium">أساور تراثية:</h4>
                  <p className="text-sm text-muted-foreground">
                    "هذه الأساور الفضية تمثل تقاليد قديمة من منطقتنا. كل رمز محفور عليها له معنى
                    خاص، وكل لون من الأحجار الكريمة يحمل دلالة روحية عميقة..."
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Rich Text Editor Demo */}
        <TabsContent value="rich-editor" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                Rich Text Editor
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Advanced text editor with formatting capabilities, language detection, and RTL
                support.
              </p>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                value={richTextContent}
                onChange={(content, metadata) => {
                  setRichTextContent(content);
                  console.log('Rich text updated:', { content, metadata });
                }}
                placeholder="Start writing your jewelry story with rich formatting..."
                maxLength={5000}
                minHeight={300}
                showWordCount={true}
                showLanguageSelector={true}
                autoDetectLanguage={true}
                onLanguageDetected={(language, direction) => {
                  console.log('Language detected:', { language, direction });
                }}
              />
            </CardContent>
          </Card>

          {/* Features Overview */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>RTL Language Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Automatic language detection</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">RTL text direction support</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Hebrew and Arabic character support</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Mixed content detection</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Language-aware alignment</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Text Formatting Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Bold, italic, underline formatting</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Text alignment (left, center, right)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Real-time word/character count</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Draft save/load functionality</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Preview mode</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Submissions Demo */}
        <TabsContent value="submissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Submitted Stories
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Stories submitted through the text input interface with their metadata.
              </p>
            </CardHeader>
            <CardContent>
              {submissions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No stories submitted yet.</p>
                  <p className="text-sm">Use the Story Input tab to create and submit a story.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions.map((submission, index) => (
                    <Card key={index} className="bg-muted/50">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                submission.metadata.textDirection === 'rtl'
                                  ? 'default'
                                  : 'secondary'
                              }
                            >
                              {submission.metadata.textDirection.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">{submission.metadata.detectedLanguage}</Badge>
                            {submission.metadata.hasMixedContent && (
                              <Badge variant="outline">Mixed Content</Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(submission.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div
                          className={cn(
                            'p-3 bg-background rounded border text-sm whitespace-pre-wrap',
                            submission.metadata.textDirection === 'rtl' && 'text-right'
                          )}
                          style={{
                            direction: submission.metadata.textDirection,
                            textAlign:
                              submission.metadata.textDirection === 'rtl' ? 'right' : 'left',
                          }}
                        >
                          {submission.content}
                        </div>
                        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <span>Words: {submission.metadata.wordCount}</span>
                            <span>Characters: {submission.metadata.characterCount}</span>
                            <span>
                              Reading time:{' '}
                              {Math.floor(submission.metadata.estimatedReadingTime / 60)}:
                              {(submission.metadata.estimatedReadingTime % 60)
                                .toString()
                                .padStart(2, '0')}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Technical Information */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Implementation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Language Detection</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Unicode range pattern matching for Hebrew (U+0590-U+05FF)</li>
                <li>• Unicode range pattern matching for Arabic (U+0600-U+06FF)</li>
                <li>• Scoring algorithm for multi-language content</li>
                <li>• Real-time detection as user types</li>
                <li>• Automatic text direction switching</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">RTL Support</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• CSS direction property for text flow</li>
                <li>• Text alignment based on language direction</li>
                <li>• UI element positioning for RTL languages</li>
                <li>• Mixed content handling (RTL + LTR)</li>
                <li>• Proper cursor positioning in RTL text</li>
              </ul>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-medium">Component Features</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>TypeScript Support</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>React Hooks</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Accessibility</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Responsive Design</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Form Validation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Draft Management</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>i18n Integration</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Theme Support</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
