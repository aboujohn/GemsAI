# Translation Key Conventions

This document outlines the conventions and best practices for managing translations in the GemsAI application.

## Namespace Organization

Translations are organized into the following namespaces:

- **`common`** - Global UI elements, actions, status messages, time-related terms
- **`auth`** - Authentication-related content (login, register, password reset)
- **`dashboard`** - Dashboard-specific content
- **`stories`** - Story creation, management, and display
- **`jewelry`** - Jewelry customization and ordering
- **`validation`** - Form validation messages and error handling

## Key Naming Conventions

### Structure

Use dot notation for nested keys:

```
section.subsection.element
```

### Examples

```json
{
  "navigation": {
    "home": "Home",
    "dashboard": "Dashboard"
  },
  "forms": {
    "validation": {
      "required": "This field is required",
      "email": "Please enter a valid email"
    }
  }
}
```

### Best Practices

1. **Use descriptive names**: Key names should clearly indicate what they represent

   - ✅ `auth.login.emailPlaceholder`
   - ❌ `auth.email1`

2. **Group related keys**: Organize related translations under common parent keys

   - ✅ `forms.validation.required`
   - ❌ `requiredFieldError`

3. **Use consistent terminology**: Maintain consistent naming patterns

   - Actions: `create`, `edit`, `delete`, `save`, `cancel`
   - Status: `pending`, `success`, `error`, `loading`
   - Navigation: `home`, `dashboard`, `settings`, `profile`

4. **Handle pluralization**: Use count-based keys for plurals
   ```json
   {
     "items": {
       "zero": "No items",
       "one": "{{count}} item",
       "other": "{{count}} items"
     }
   }
   ```

## Language-Specific Guidelines

### Hebrew (he)

- Use proper Hebrew punctuation and grammar
- Pay attention to gender agreement in verbs and adjectives
- Use appropriate Hebrew typography (נקודות, טעמים when necessary)
- Follow RTL text flow conventions

### English (en)

- Use American English spelling conventions
- Follow sentence case for UI elements
- Use active voice when possible

## File Structure

```
public/
  locales/
    he/
      common.json
      auth.json
      dashboard.json
      stories.json
      jewelry.json
      validation.json
    en/
      common.json
      auth.json
      dashboard.json
      stories.json
      jewelry.json
      validation.json
```

## Translation Workflow

### Adding New Translations

1. **Identify the namespace**: Determine which namespace the new key belongs to
2. **Create the key structure**: Use dot notation and follow naming conventions
3. **Add to all locales**: Ensure the key exists in both Hebrew and English files
4. **Validate**: Run the validation script to ensure syntax correctness

### Using the CLI Tools

```bash
# Check for missing translations
node scripts/translation-cli.js missing

# Validate all translation files
node scripts/translation-cli.js validate

# View translation statistics
node scripts/translation-cli.js stats

# Create missing files
node scripts/translation-cli.js scaffold
```

### Development Workflow

1. **Before starting development**: Run `npm run translations:validate`
2. **When adding new UI elements**: Add translation keys immediately
3. **Before committing**: Ensure all translations are complete and validated
4. **Code review**: Check that new translations follow conventions

## Common Patterns

### Form Elements

```json
{
  "forms": {
    "labels": {
      "email": "Email Address",
      "password": "Password",
      "confirmPassword": "Confirm Password"
    },
    "placeholders": {
      "email": "Enter your email",
      "password": "Enter your password"
    },
    "validation": {
      "required": "This field is required",
      "emailInvalid": "Please enter a valid email",
      "passwordTooShort": "Password must be at least 8 characters"
    }
  }
}
```

### Actions and Buttons

```json
{
  "actions": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "create": "Create",
    "submit": "Submit"
  }
}
```

### Status Messages

```json
{
  "status": {
    "loading": "Loading...",
    "success": "Operation completed successfully",
    "error": "An error occurred",
    "noResults": "No results found"
  }
}
```

## Interpolation and Variables

Use i18next interpolation for dynamic content:

```json
{
  "welcome": "Welcome, {{name}}!",
  "itemCount": "You have {{count}} items",
  "lastUpdated": "Last updated: {{date}}"
}
```

## Context and Comments

For complex translations, add context in the key structure:

```json
{
  "jewelry": {
    "status": {
      "pending": "Pending Review",
      "approved": "Approved for Production",
      "manufacturing": "In Manufacturing"
    }
  }
}
```

## Quality Assurance

### Automated Checks

- JSON syntax validation
- Missing translation detection
- Key consistency across locales

### Manual Review

- Cultural appropriateness
- Gender-neutral language where applicable
- Consistency with brand voice
- Native speaker review for Hebrew translations

## Package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "translations:validate": "node scripts/translation-cli.js validate",
    "translations:missing": "node scripts/translation-cli.js missing",
    "translations:stats": "node scripts/translation-cli.js stats",
    "translations:scaffold": "node scripts/translation-cli.js scaffold"
  }
}
```
