// DatabaseDemo Component - Comprehensive demonstration of database i18n features
// Shows all aspects of the Supabase internationalization system in action

'use client';

import { useState } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import {
  useLanguages,
  useStories,
  useProducts,
  useJewelers,
  useSystemTranslations,
  useEnumTranslations,
} from '@/lib/hooks/useI18nDatabase';
import { SystemText } from '@/components/ui/SystemText';
import {
  EnumText,
  OrderStatus,
  UserRole,
  ProductCategory,
  JewelryStyle,
  Material,
  Emotion,
} from '@/components/ui/EnumText';
import { Button } from '@/components/ui/Button';

export function DatabaseDemo() {
  const { language, setLanguage } = useLanguage();
  const [activeSection, setActiveSection] = useState<string>('overview');

  // Database hooks
  const { languages, loading: languagesLoading } = useLanguages();
  const { stories, loading: storiesLoading } = useStories();
  const { products, loading: productsLoading } = useProducts();
  const { jewelers, loading: jewelersLoading } = useJewelers();
  const { translations: systemTranslations, loading: systemLoading } = useSystemTranslations();
  const { translations: enumTranslations, loading: enumLoading } = useEnumTranslations();

  const sections = [
    { id: 'overview', title: 'Database Overview', icon: '🗄️' },
    { id: 'languages', title: 'Languages', icon: '🌐' },
    { id: 'system', title: 'System Translations', icon: '⚙️' },
    { id: 'enums', title: 'Enum Translations', icon: '📋' },
    { id: 'content', title: 'Content (Stories)', icon: '📖' },
    { id: 'products', title: 'Products', icon: '💎' },
    { id: 'jewelers', title: 'Jewelers', icon: '👨‍🎨' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🗄️ Database Internationalization Demo
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Comprehensive demonstration of our Supabase-powered multilingual database system.
              This showcases Hebrew-first architecture with automatic English fallback.
            </p>
            
            {/* Language Switcher */}
            <div className="mt-6 flex justify-center gap-4">
              <Button
                onClick={() => setLanguage('he')}
                variant={language === 'he' ? 'default' : 'outline'}
                className="flex items-center gap-2"
              >
                🇮🇱 עברית
              </Button>
              <Button
                onClick={() => setLanguage('en')}
                variant={language === 'en' ? 'default' : 'outline'}
                className="flex items-center gap-2"
              >
                🇺🇸 English
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-wrap justify-center gap-2">
            {sections.map((section) => (
              <Button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                variant={activeSection === section.id ? 'default' : 'outline'}
                size="sm"
                className="flex items-center gap-2"
              >
                <span>{section.icon}</span>
                <span>{section.title}</span>
              </Button>
            ))}
          </div>

          {/* Content Sections */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            {activeSection === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Database Architecture Overview</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">🏗️ Schema Design</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>• <strong>Hebrew-First Architecture:</strong> Primary content in Hebrew with English fallback</li>
                      <li>• <strong>Multilingual Views:</strong> Automatic language resolution with fallback logic</li>
                      <li>• <strong>System Translations:</strong> UI elements stored in database with JSONB</li>
                      <li>• <strong>Enum Translations:</strong> Localized enum values for dropdowns and status</li>
                      <li>• <strong>Content Tables:</strong> Stories, products, and jewelers with full i18n support</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">⚡ Performance Features</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>• <strong>Strategic Indexing:</strong> Optimized for Hebrew text search</li>
                      <li>• <strong>GIN Indexes:</strong> Fast JSONB translation lookups</li>
                      <li>• <strong>Materialized Views:</strong> Pre-computed multilingual content</li>
                      <li>• <strong>Row Level Security:</strong> Language-aware access control</li>
                      <li>• <strong>Full-Text Search:</strong> Hebrew and English search capabilities</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">🔄 Current Status</h4>
                  <p className="text-blue-800">
                    Database schema is designed and ready for deployment. 
                    This demo shows the planned functionality using mock data and the actual ORM layer.
                  </p>
                </div>
              </div>
            )}

            {activeSection === 'languages' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">🌐 Language Management</h2>
                
                {languagesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading languages...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Mock language data for demo */}
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">🇮🇱 Hebrew (עברית)</h3>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Primary</span>
                        </div>
                        <p className="text-sm text-gray-600">Code: he-IL</p>
                        <p className="text-sm text-gray-600">Direction: RTL</p>
                        <p className="text-sm text-gray-600">Status: Active</p>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">🇺🇸 English</h3>
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">Fallback</span>
                        </div>
                        <p className="text-sm text-gray-600">Code: en-US</p>
                        <p className="text-sm text-gray-600">Direction: LTR</p>
                        <p className="text-sm text-gray-600">Status: Active</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Language Detection Logic</h4>
                      <p className="text-sm text-gray-600">
                        Current Language: <strong>{language === 'he' ? 'Hebrew (עברית)' : 'English'}</strong>
                      </p>
                      <p className="text-sm text-gray-600">
                        Direction: <strong>{language === 'he' ? 'RTL (Right-to-Left)' : 'LTR (Left-to-Right)'}</strong>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'system' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">⚙️ System Translations</h2>
                
                <div className="space-y-4">
                  <p className="text-gray-600">
                    System translations are UI elements stored in the database with JSONB for flexible localization.
                  </p>
                  
                  <div className="grid gap-4">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-3">Common UI Elements</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Navigation:</p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• <SystemText translationKey="nav.home" fallback="Home" /></li>
                            <li>• <SystemText translationKey="nav.dashboard" fallback="Dashboard" /></li>
                            <li>• <SystemText translationKey="nav.stories" fallback="Stories" /></li>
                            <li>• <SystemText translationKey="nav.settings" fallback="Settings" /></li>
                          </ul>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Actions:</p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• <SystemText translationKey="action.save" fallback="Save" /></li>
                            <li>• <SystemText translationKey="action.cancel" fallback="Cancel" /></li>
                            <li>• <SystemText translationKey="action.delete" fallback="Delete" /></li>
                            <li>• <SystemText translationKey="action.edit" fallback="Edit" /></li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'enums' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">📋 Enum Translations</h2>
                
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Enum translations provide localized values for dropdowns, status indicators, and categorical data.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-3">Order Status</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">pending:</span>
                            <OrderStatus value="pending" />
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">confirmed:</span>
                            <OrderStatus value="confirmed" />
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">completed:</span>
                            <OrderStatus value="completed" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-3">User Roles</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">customer:</span>
                            <UserRole value="customer" />
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">jeweler:</span>
                            <UserRole value="jeweler" />
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">admin:</span>
                            <UserRole value="admin" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-3">Product Categories</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">rings:</span>
                            <ProductCategory value="rings" />
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">necklaces:</span>
                            <ProductCategory value="necklaces" />
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">earrings:</span>
                            <ProductCategory value="earrings" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-3">Materials</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">gold:</span>
                            <Material value="gold" />
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">silver:</span>
                            <Material value="silver" />
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">platinum:</span>
                            <Material value="platinum" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'content' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">📖 Content Management (Stories)</h2>
                
                {storiesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading stories...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      Stories demonstrate multilingual content management with Hebrew-first approach and automatic fallback.
                    </p>
                    
                    {/* Mock story data for demo */}
                    <div className="grid gap-4">
                      <div className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">
                            {language === 'he' ? 'סיפור אהבה ראשון' : 'First Love Story'}
                          </h3>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Published</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {language === 'he' 
                            ? 'סיפור רומנטי על זוג צעיר שמתחתן ומזמין טבעת אירוסין מיוחדת'
                            : 'A romantic story about a young couple getting engaged and ordering a special engagement ring'
                          }
                        </p>
                        <div className="flex gap-2 text-xs text-gray-500">
                          <span>Author: Sarah Cohen</span>
                          <span>•</span>
                          <span>Created: 2024-01-15</span>
                          <span>•</span>
                          <span>Language: {language === 'he' ? 'עברית' : 'Hebrew'}</span>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">
                            {language === 'he' ? 'מורשת משפחתית' : 'Family Heritage'}
                          </h3>
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Draft</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {language === 'he'
                            ? 'סיפור על תכשיט עתיק שעובר מדור לדור במשפחה'
                            : 'A story about an antique jewelry piece passed down through generations'
                          }
                        </p>
                        <div className="flex gap-2 text-xs text-gray-500">
                          <span>Author: David Levi</span>
                          <span>•</span>
                          <span>Created: 2024-01-20</span>
                          <span>•</span>
                          <span>Language: {language === 'he' ? 'עברית' : 'Hebrew'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'products' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">💎 Product Catalog</h2>
                
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Product catalog with multilingual descriptions, specifications, and pricing in multiple currencies.
                  </p>
                  
                  {/* Mock product data */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">
                          {language === 'he' ? 'טבעת יהלום קלאסית' : 'Classic Diamond Ring'}
                        </h3>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Available</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {language === 'he'
                          ? 'טבעת יהלום מרהיבה בזהב לבן 18 קראט עם יהלום מרכזי 1 קראט'
                          : 'Stunning diamond ring in 18k white gold with 1 carat center diamond'
                        }
                      </p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Material:</span>
                          <Material value="gold" />
                        </div>
                        <div className="flex justify-between">
                          <span>Category:</span>
                          <ProductCategory value="rings" />
                        </div>
                        <div className="flex justify-between">
                          <span>Price:</span>
                          <span className="font-semibold">
                            {language === 'he' ? '₪15,000' : '$4,200'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">
                          {language === 'he' ? 'שרשרת פנינים אלגנטית' : 'Elegant Pearl Necklace'}
                        </h3>
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">Limited</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {language === 'he'
                          ? 'שרשרת פנינים יפהפייה עם פנינים טבעיות ואבזם זהב'
                          : 'Beautiful pearl necklace with natural pearls and gold clasp'
                        }
                      </p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Material:</span>
                          <Material value="gold" />
                        </div>
                        <div className="flex justify-between">
                          <span>Category:</span>
                          <ProductCategory value="necklaces" />
                        </div>
                        <div className="flex justify-between">
                          <span>Price:</span>
                          <span className="font-semibold">
                            {language === 'he' ? '₪8,500' : '$2,400'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'jewelers' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">👨‍🎨 Jeweler Profiles</h2>
                
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Jeweler profiles with multilingual biographies, specializations, and portfolio descriptions.
                  </p>
                  
                  {/* Mock jeweler data */}
                  <div className="grid gap-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                          MC
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-lg">
                              {language === 'he' ? 'מיכאל כהן' : 'Michael Cohen'}
                            </h3>
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Active</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            {language === 'he'
                              ? 'צורף מומחה עם 15 שנות ניסיון בעיצוב תכשיטים מותאמים אישית. מתמחה בטבעות אירוסין ותכשיטי יוקרה.'
                              : 'Expert jeweler with 15 years of experience in custom jewelry design. Specializes in engagement rings and luxury jewelry.'
                            }
                          </p>
                          <div className="flex gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Specialization:</span>
                              <JewelryStyle value="classic" className="ml-1" />
                            </div>
                            <div>
                              <span className="text-gray-500">Location:</span>
                              <span className="ml-1">{language === 'he' ? 'תל אביב' : 'Tel Aviv'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Rating:</span>
                              <span className="ml-1">⭐ 4.9/5</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                          SL
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-lg">
                              {language === 'he' ? 'שרה לוי' : 'Sarah Levi'}
                            </h3>
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Active</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            {language === 'he'
                              ? 'מעצבת תכשיטים יצירתית המתמחה בעיצובים מודרניים ומינימליסטיים. זוכת פרסים בתחרויות עיצוב בינלאומיות.'
                              : 'Creative jewelry designer specializing in modern and minimalist designs. Award winner in international design competitions.'
                            }
                          </p>
                          <div className="flex gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Specialization:</span>
                              <JewelryStyle value="modern" className="ml-1" />
                            </div>
                            <div>
                              <span className="text-gray-500">Location:</span>
                              <span className="ml-1">{language === 'he' ? 'ירושלים' : 'Jerusalem'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Rating:</span>
                              <span className="ml-1">⭐ 4.8/5</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
