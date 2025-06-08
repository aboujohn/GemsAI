-- Initial Data Seeding for GemsAI Internationalization (Supabase)
-- This file populates the internationalization tables with initial data

-- Insert supported languages (Hebrew first, then English)
INSERT INTO public.languages (id, name, direction, is_default, is_active) VALUES
('he', '{"he": "עברית", "en": "Hebrew"}', 'rtl', TRUE, TRUE),
('en', '{"he": "אנגלית", "en": "English"}', 'ltr', FALSE, TRUE)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  direction = EXCLUDED.direction,
  is_default = EXCLUDED.is_default,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Insert common system translations for UI elements
INSERT INTO public.system_translations (translation_key, translations, context, description) VALUES
-- Navigation & Layout
('navigation.home', '{"he": "דף הבית", "en": "Home"}', 'ui', 'Home page navigation link'),
('navigation.stories', '{"he": "סיפורים", "en": "Stories"}', 'ui', 'Stories section navigation'),
('navigation.products', '{"he": "תכשיטים", "en": "Jewelry"}', 'ui', 'Products section navigation'),
('navigation.jewelers', '{"he": "יצרנים", "en": "Jewelers"}', 'ui', 'Jewelers section navigation'),
('navigation.dashboard', '{"he": "לוח בקרה", "en": "Dashboard"}', 'ui', 'Dashboard navigation'),
('navigation.profile', '{"he": "פרופיל", "en": "Profile"}', 'ui', 'User profile navigation'),

-- Common Buttons
('buttons.save', '{"he": "שמור", "en": "Save"}', 'ui', 'Save button text'),
('buttons.cancel', '{"he": "ביטול", "en": "Cancel"}', 'ui', 'Cancel button text'),
('buttons.edit', '{"he": "עריכה", "en": "Edit"}', 'ui', 'Edit button text'),
('buttons.delete', '{"he": "מחיקה", "en": "Delete"}', 'ui', 'Delete button text'),
('buttons.create', '{"he": "יצירה", "en": "Create"}', 'ui', 'Create button text'),
('buttons.submit', '{"he": "שליחה", "en": "Submit"}', 'ui', 'Submit button text'),
('buttons.continue', '{"he": "המשך", "en": "Continue"}', 'ui', 'Continue button text'),
('buttons.back', '{"he": "חזרה", "en": "Back"}', 'ui', 'Back button text'),
('buttons.next', '{"he": "הבא", "en": "Next"}', 'ui', 'Next button text'),
('buttons.previous', '{"he": "הקודם", "en": "Previous"}', 'ui', 'Previous button text'),
('buttons.search', '{"he": "חיפוש", "en": "Search"}', 'ui', 'Search button text'),
('buttons.filter', '{"he": "סינון", "en": "Filter"}', 'ui', 'Filter button text'),
('buttons.close', '{"he": "סגירה", "en": "Close"}', 'ui', 'Close button text'),
('buttons.upload', '{"he": "העלאה", "en": "Upload"}', 'ui', 'Upload button text'),
('buttons.download', '{"he": "הורדה", "en": "Download"}', 'ui', 'Download button text'),

-- Status Messages
('messages.loading', '{"he": "טוען...", "en": "Loading..."}', 'ui', 'Loading state message'),
('messages.success', '{"he": "פעולה בוצעה בהצלחה", "en": "Operation completed successfully"}', 'ui', 'Success message'),
('messages.error', '{"he": "אירעה שגיאה", "en": "An error occurred"}', 'ui', 'Generic error message'),
('messages.no_results', '{"he": "לא נמצאו תוצאות", "en": "No results found"}', 'ui', 'No search results message'),
('messages.empty_state', '{"he": "אין פריטים להצגה", "en": "No items to display"}', 'ui', 'Empty state message'),

-- Form Labels & Placeholders
('forms.name', '{"he": "שם", "en": "Name"}', 'ui', 'Name field label'),
('forms.email', '{"he": "אימייל", "en": "Email"}', 'ui', 'Email field label'),
('forms.password', '{"he": "סיסמה", "en": "Password"}', 'ui', 'Password field label'),
('forms.description', '{"he": "תיאור", "en": "Description"}', 'ui', 'Description field label'),
('forms.title', '{"he": "כותרת", "en": "Title"}', 'ui', 'Title field label'),
('forms.content', '{"he": "תוכן", "en": "Content"}', 'ui', 'Content field label'),
('forms.price', '{"he": "מחיר", "en": "Price"}', 'ui', 'Price field label'),
('forms.category', '{"he": "קטגוריה", "en": "Category"}', 'ui', 'Category field label'),
('forms.tags', '{"he": "תגיות", "en": "Tags"}', 'ui', 'Tags field label'),

-- Placeholders
('placeholders.search', '{"he": "חפש...", "en": "Search..."}', 'ui', 'Search input placeholder'),
('placeholders.email', '{"he": "הזן כתובת אימייל", "en": "Enter email address"}', 'ui', 'Email input placeholder'),
('placeholders.name', '{"he": "הזן שם", "en": "Enter name"}', 'ui', 'Name input placeholder'),
('placeholders.description', '{"he": "הזן תיאור", "en": "Enter description"}', 'ui', 'Description input placeholder'),

-- Authentication
('auth.login', '{"he": "התחברות", "en": "Login"}', 'auth', 'Login page title'),
('auth.register', '{"he": "הרשמה", "en": "Register"}', 'auth', 'Registration page title'),
('auth.logout', '{"he": "התנתקות", "en": "Logout"}', 'auth', 'Logout action'),
('auth.forgot_password', '{"he": "שכחתי סיסמה", "en": "Forgot Password"}', 'auth', 'Forgot password link'),
('auth.reset_password', '{"he": "איפוס סיסמה", "en": "Reset Password"}', 'auth', 'Reset password action'),

-- Story Creation
('stories.create_title', '{"he": "צור סיפור חדש", "en": "Create New Story"}', 'stories', 'Story creation page title'),
('stories.tell_story', '{"he": "ספר את הסיפור שלך", "en": "Tell Your Story"}', 'stories', 'Story creation prompt'),
('stories.emotion_tags', '{"he": "תגי רגש", "en": "Emotion Tags"}', 'stories', 'Emotion tags label'),
('stories.generated_sketch', '{"he": "סקיצה שנוצרה", "en": "Generated Sketch"}', 'stories', 'Generated sketch label'),

-- Products & Jewelry
('products.view_details', '{"he": "צפה בפרטים", "en": "View Details"}', 'products', 'View product details link'),
('products.add_to_cart', '{"he": "הוסף לעגלה", "en": "Add to Cart"}', 'products', 'Add to cart button'),
('products.materials', '{"he": "חומרים", "en": "Materials"}', 'products', 'Materials section'),
('products.care_instructions', '{"he": "הוראות טיפוח", "en": "Care Instructions"}', 'products', 'Care instructions section'),
('products.style_tags', '{"he": "תגי סגנון", "en": "Style Tags"}', 'products', 'Style tags label'),

-- Jewelers
('jewelers.profile', '{"he": "פרופיל יצרן", "en": "Jeweler Profile"}', 'jewelers', 'Jeweler profile page title'),
('jewelers.specialties', '{"he": "התמחויות", "en": "Specialties"}', 'jewelers', 'Jeweler specialties'),
('jewelers.portfolio', '{"he": "תיק עבודות", "en": "Portfolio"}', 'jewelers', 'Jeweler portfolio'),
('jewelers.contact', '{"he": "צור קשר", "en": "Contact"}', 'jewelers', 'Contact jeweler button'),

-- Orders & Gifts
('orders.status', '{"he": "סטטוס הזמנה", "en": "Order Status"}', 'orders', 'Order status label'),
('gifts.create', '{"he": "צור מתנה", "en": "Create Gift"}', 'gifts', 'Create gift button'),
('gifts.share', '{"he": "שתף מתנה", "en": "Share Gift"}', 'gifts', 'Share gift button'),

-- Time & Dates
('time.now', '{"he": "עכשיו", "en": "now"}', 'time', 'Current time indicator'),
('time.minutes_ago', '{"he": "לפני {count} דקות", "en": "{count} minutes ago"}', 'time', 'Minutes ago format'),
('time.hours_ago', '{"he": "לפני {count} שעות", "en": "{count} hours ago"}', 'time', 'Hours ago format'),
('time.days_ago', '{"he": "לפני {count} ימים", "en": "{count} days ago"}', 'time', 'Days ago format'),
('time.created_at', '{"he": "נוצר בתאריך", "en": "Created on"}', 'time', 'Creation date label'),
('time.updated_at', '{"he": "עודכן בתאריך", "en": "Updated on"}', 'time', 'Update date label')

ON CONFLICT (translation_key) DO UPDATE SET
  translations = EXCLUDED.translations,
  context = EXCLUDED.context,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Insert enum translations for common status values
INSERT INTO public.enum_translations (enum_type, enum_value, translations, sort_order) VALUES
-- Order Status
('order_status', 'pending', '{"he": "ממתין", "en": "Pending"}', 1),
('order_status', 'confirmed', '{"he": "מאושר", "en": "Confirmed"}', 2),
('order_status', 'in_progress', '{"he": "בתהליך", "en": "In Progress"}', 3),
('order_status', 'completed', '{"he": "הושלם", "en": "Completed"}', 4),
('order_status', 'shipped', '{"he": "נשלח", "en": "Shipped"}', 5),
('order_status', 'delivered', '{"he": "נמסר", "en": "Delivered"}', 6),
('order_status', 'cancelled', '{"he": "בוטל", "en": "Cancelled"}', 7),
('order_status', 'refunded', '{"he": "הוחזר", "en": "Refunded"}', 8),

-- Translation Status
('translation_status', 'draft', '{"he": "טיוטה", "en": "Draft"}', 1),
('translation_status', 'pending', '{"he": "ממתין לבדיקה", "en": "Pending Review"}', 2),
('translation_status', 'approved', '{"he": "מאושר", "en": "Approved"}', 3),
('translation_status', 'published', '{"he": "פורסם", "en": "Published"}', 4),
('translation_status', 'rejected', '{"he": "נדחה", "en": "Rejected"}', 5),

-- User Roles
('user_role', 'user', '{"he": "משתמש", "en": "User"}', 1),
('user_role', 'jeweler', '{"he": "יצרן", "en": "Jeweler"}', 2),
('user_role', 'translator', '{"he": "מתרגם", "en": "Translator"}', 3),
('user_role', 'admin', '{"he": "מנהל", "en": "Administrator"}', 4),

-- Product Categories
('product_category', 'rings', '{"he": "טבעות", "en": "Rings"}', 1),
('product_category', 'necklaces', '{"he": "שרשראות", "en": "Necklaces"}', 2),
('product_category', 'earrings', '{"he": "עגילים", "en": "Earrings"}', 3),
('product_category', 'bracelets', '{"he": "צמידים", "en": "Bracelets"}', 4),
('product_category', 'pendants', '{"he": "תליונים", "en": "Pendants"}', 5),
('product_category', 'brooches', '{"he": "סיכות", "en": "Brooches"}', 6),
('product_category', 'sets', '{"he": "סטים", "en": "Sets"}', 7),

-- Jewelry Styles
('jewelry_style', 'classic', '{"he": "קלאסי", "en": "Classic"}', 1),
('jewelry_style', 'modern', '{"he": "מודרני", "en": "Modern"}', 2),
('jewelry_style', 'vintage', '{"he": "וינטג", "en": "Vintage"}', 3),
('jewelry_style', 'minimalist', '{"he": "מינימליסטי", "en": "Minimalist"}', 4),
('jewelry_style', 'romantic', '{"he": "רומנטי", "en": "Romantic"}', 5),
('jewelry_style', 'bohemian', '{"he": "בוהמיאני", "en": "Bohemian"}', 6),
('jewelry_style', 'luxury', '{"he": "יוקרתי", "en": "Luxury"}', 7),
('jewelry_style', 'ethnic', '{"he": "אתני", "en": "Ethnic"}', 8),

-- Emotions
('emotion', 'love', '{"he": "אהבה", "en": "Love"}', 1),
('emotion', 'joy', '{"he": "שמחה", "en": "Joy"}', 2),
('emotion', 'celebration', '{"he": "חגיגה", "en": "Celebration"}', 3),
('emotion', 'nostalgia', '{"he": "געגועים", "en": "Nostalgia"}', 4),
('emotion', 'gratitude', '{"he": "הכרת תודה", "en": "Gratitude"}', 5),
('emotion', 'hope', '{"he": "תקווה", "en": "Hope"}', 6),
('emotion', 'elegance', '{"he": "אלגנטיות", "en": "Elegance"}', 7),
('emotion', 'strength', '{"he": "כוח", "en": "Strength"}', 8),

-- Materials
('material', 'gold', '{"he": "זהב", "en": "Gold"}', 1),
('material', 'silver', '{"he": "כסף", "en": "Silver"}', 2),
('material', 'platinum', '{"he": "פלטינה", "en": "Platinum"}', 3),
('material', 'diamond', '{"he": "יהלום", "en": "Diamond"}', 4),
('material', 'pearl', '{"he": "פנינה", "en": "Pearl"}', 5),
('material', 'emerald', '{"he": "אמרלד", "en": "Emerald"}', 6),
('material', 'ruby', '{"he": "רובי", "en": "Ruby"}', 7),
('material', 'sapphire', '{"he": "ספיר", "en": "Sapphire"}', 8)

ON CONFLICT (enum_type, enum_value) DO UPDATE SET
  translations = EXCLUDED.translations,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- Create default admin user metadata (if needed for testing)
-- Note: This would typically be done through Supabase Auth signup
-- COMMENT: Admin user should be created through the Supabase Auth interface with role metadata

-- Log successful seeding
DO $$
BEGIN
  RAISE NOTICE 'GemsAI internationalization data seeded successfully';
  RAISE NOTICE 'Languages: % active', (SELECT COUNT(*) FROM public.languages WHERE is_active = TRUE);
  RAISE NOTICE 'System translations: %', (SELECT COUNT(*) FROM public.system_translations WHERE is_active = TRUE);
  RAISE NOTICE 'Enum translations: %', (SELECT COUNT(*) FROM public.enum_translations WHERE is_active = TRUE);
END $$; 