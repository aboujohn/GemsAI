'use client';

import { useState, useRef } from 'react';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { DirectionalContainer } from '@/components/ui/DirectionalContainer';
import { DirectionalFlex } from '@/components/ui/DirectionalFlex';
import { Icons } from '@/components/ui/Icons';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface ProductFormData {
  name: string;
  sku: string;
  price: number;
  currency: string;
  category: string;
  materials: string[];
  dimensions: {
    width?: number;
    height?: number;
    depth?: number;
    weight?: number;
  };
  customizable: boolean;
  leadTimeDays: number;
  inventoryCount: number;
  emotionTags: string[];
  styleTags: string[];
  description: string;
  images: File[];
}

interface JewelerProductFormProps {
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<ProductFormData>;
  loading?: boolean;
}

const CATEGORIES = [
  'rings',
  'necklaces',
  'earrings',
  'bracelets',
  'brooches',
  'watches',
  'sets',
  'custom'
];

const MATERIALS = [
  'gold',
  'silver',
  'platinum',
  'rose_gold',
  'white_gold',
  'stainless_steel',
  'titanium',
  'copper',
  'bronze',
  'diamond',
  'ruby',
  'sapphire',
  'emerald',
  'pearl',
  'crystal',
  'leather',
  'fabric'
];

const EMOTION_TAGS = [
  'love',
  'joy',
  'elegance',
  'strength',
  'peace',
  'passion',
  'luxury',
  'vintage',
  'modern',
  'classic',
  'romantic',
  'bold'
];

const STYLE_TAGS = [
  'minimalist',
  'vintage',
  'modern',
  'classic',
  'bohemian',
  'luxury',
  'casual',
  'formal',
  'statement',
  'delicate',
  'geometric',
  'organic'
];

export function JewelerProductForm({
  onSubmit,
  onCancel,
  initialData = {},
  loading = false,
}: JewelerProductFormProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData.name || '',
    sku: initialData.sku || '',
    price: initialData.price || 0,
    currency: initialData.currency || 'ILS',
    category: initialData.category || '',
    materials: initialData.materials || [],
    dimensions: initialData.dimensions || {},
    customizable: initialData.customizable || false,
    leadTimeDays: initialData.leadTimeDays || 7,
    inventoryCount: initialData.inventoryCount || 1,
    emotionTags: initialData.emotionTags || [],
    styleTags: initialData.styleTags || [],
    description: initialData.description || '',
    images: initialData.images || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleDimensionChange = (dimension: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [dimension]: value,
      },
    }));
  };

  const handleArrayToggle = (array: string[], value: string, field: keyof ProductFormData) => {
    const newArray = array.includes(value)
      ? array.filter(item => item !== value)
      : [...array, value];
    
    handleInputChange(field, newArray);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      setErrors(prev => ({
        ...prev,
        images: t('jeweler.products.form.errors.invalidImageType'),
      }));
      return;
    }

    // Validate file sizes (max 5MB each)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    
    if (oversizedFiles.length > 0) {
      setErrors(prev => ({
        ...prev,
        images: t('jeweler.products.form.errors.imageTooLarge'),
      }));
      return;
    }

    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
    
    handleInputChange('images', [...formData.images, ...files]);
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviewUrls = imagePreviewUrls.filter((_, i) => i !== index);
    
    // Revoke the URL to prevent memory leaks
    if (imagePreviewUrls[index]) {
      URL.revokeObjectURL(imagePreviewUrls[index]);
    }
    
    setImagePreviewUrls(newPreviewUrls);
    handleInputChange('images', newImages);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('jeweler.products.form.errors.nameRequired');
    }

    if (!formData.sku.trim()) {
      newErrors.sku = t('jeweler.products.form.errors.skuRequired');
    }

    if (formData.price <= 0) {
      newErrors.price = t('jeweler.products.form.errors.priceRequired');
    }

    if (!formData.category) {
      newErrors.category = t('jeweler.products.form.errors.categoryRequired');
    }

    if (formData.materials.length === 0) {
      newErrors.materials = t('jeweler.products.form.errors.materialsRequired');
    }

    if (formData.images.length === 0) {
      newErrors.images = t('jeweler.products.form.errors.imagesRequired');
    }

    if (formData.leadTimeDays < 1) {
      newErrors.leadTimeDays = t('jeweler.products.form.errors.leadTimeRequired');
    }

    if (formData.inventoryCount < 0) {
      newErrors.inventoryCount = t('jeweler.products.form.errors.inventoryRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting product form:', error);
      setErrors({ submit: t('jeweler.products.form.errors.submitFailed') });
    }
  };

  return (
    <DirectionalContainer>
      <Card className="p-6">
        <DirectionalFlex className="justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData.name ? t('jeweler.products.form.editTitle') : t('jeweler.products.form.addTitle')}
          </h2>
          <Button variant="outline" onClick={onCancel}>
            <Icons.X className="h-4 w-4 mr-2" />
            {t('common.cancel')}
          </Button>
        </DirectionalFlex>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">{t('jeweler.products.form.name')} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder={t('jeweler.products.form.namePlaceholder')}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="sku">{t('jeweler.products.form.sku')} *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => handleInputChange('sku', e.target.value)}
                placeholder={t('jeweler.products.form.skuPlaceholder')}
                className={errors.sku ? 'border-red-500' : ''}
              />
              {errors.sku && <p className="text-sm text-red-600 mt-1">{errors.sku}</p>}
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="price">{t('jeweler.products.form.price')} *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={errors.price ? 'border-red-500' : ''}
              />
              {errors.price && <p className="text-sm text-red-600 mt-1">{errors.price}</p>}
            </div>

            <div>
              <Label htmlFor="currency">{t('jeweler.products.form.currency')}</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => handleInputChange('currency', value)}
              >
                <option value="ILS">ILS (₪)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </Select>
            </div>
          </div>

          {/* Category and Materials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">{t('jeweler.products.form.category')} *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange('category', value)}
                className={errors.category ? 'border-red-500' : ''}
              >
                <option value="">{t('jeweler.products.form.selectCategory')}</option>
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {t(`jeweler.products.categories.${category}`)}
                  </option>
                ))}
              </Select>
              {errors.category && <p className="text-sm text-red-600 mt-1">{errors.category}</p>}
            </div>

            <div>
              <Label>{t('jeweler.products.form.materials')} *</Label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                {MATERIALS.map(material => (
                  <label key={material} className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.materials.includes(material)}
                      onCheckedChange={() => handleArrayToggle(formData.materials, material, 'materials')}
                    />
                    <span className="text-sm">{t(`jeweler.products.materials.${material}`)}</span>
                  </label>
                ))}
              </div>
              {errors.materials && <p className="text-sm text-red-600 mt-1">{errors.materials}</p>}
            </div>
          </div>

          {/* Dimensions */}
          <div>
            <Label>{t('jeweler.products.form.dimensions')}</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder={t('jeweler.products.form.width')}
                  value={formData.dimensions.width || ''}
                  onChange={(e) => handleDimensionChange('width', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder={t('jeweler.products.form.height')}
                  value={formData.dimensions.height || ''}
                  onChange={(e) => handleDimensionChange('height', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder={t('jeweler.products.form.depth')}
                  value={formData.dimensions.depth || ''}
                  onChange={(e) => handleDimensionChange('depth', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder={t('jeweler.products.form.weight')}
                  value={formData.dimensions.weight || ''}
                  onChange={(e) => handleDimensionChange('weight', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          {/* Business Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="leadTime">{t('jeweler.products.form.leadTime')} *</Label>
              <Input
                id="leadTime"
                type="number"
                min="1"
                value={formData.leadTimeDays}
                onChange={(e) => handleInputChange('leadTimeDays', parseInt(e.target.value) || 1)}
                className={errors.leadTimeDays ? 'border-red-500' : ''}
              />
              {errors.leadTimeDays && <p className="text-sm text-red-600 mt-1">{errors.leadTimeDays}</p>}
            </div>

            <div>
              <Label htmlFor="inventory">{t('jeweler.products.form.inventory')} *</Label>
              <Input
                id="inventory"
                type="number"
                min="0"
                value={formData.inventoryCount}
                onChange={(e) => handleInputChange('inventoryCount', parseInt(e.target.value) || 0)}
                className={errors.inventoryCount ? 'border-red-500' : ''}
              />
              {errors.inventoryCount && <p className="text-sm text-red-600 mt-1">{errors.inventoryCount}</p>}
            </div>

            <div className="flex items-center">
              <label className="flex items-center space-x-2">
                <Checkbox
                  checked={formData.customizable}
                  onCheckedChange={(checked) => handleInputChange('customizable', checked)}
                />
                <span>{t('jeweler.products.form.customizable')}</span>
              </label>
            </div>
          </div>

          {/* Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>{t('jeweler.products.form.emotionTags')}</Label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                {EMOTION_TAGS.map(tag => (
                  <label key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.emotionTags.includes(tag)}
                      onCheckedChange={() => handleArrayToggle(formData.emotionTags, tag, 'emotionTags')}
                    />
                    <span className="text-sm">{t(`emotions.${tag}`)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label>{t('jeweler.products.form.styleTags')}</Label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                {STYLE_TAGS.map(tag => (
                  <label key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.styleTags.includes(tag)}
                      onCheckedChange={() => handleArrayToggle(formData.styleTags, tag, 'styleTags')}
                    />
                    <span className="text-sm">{t(`jewelry.styles.${tag}`)}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">{t('jeweler.products.form.description')}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder={t('jeweler.products.form.descriptionPlaceholder')}
              rows={4}
            />
          </div>

          {/* Images */}
          <div>
            <Label>{t('jeweler.products.form.images')} *</Label>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Icons.Upload className="h-4 w-4 mr-2" />
                  {t('jeweler.products.form.uploadImages')}
                </Button>
                <span className="text-sm text-gray-600">
                  {t('jeweler.products.form.imageFormats')}
                </span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />

              {imagePreviewUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imagePreviewUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md border"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                        onClick={() => removeImage(index)}
                      >
                        <Icons.X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {errors.images && <p className="text-sm text-red-600">{errors.images}</p>}
            </div>
          </div>

          {/* Submit */}
          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          <DirectionalFlex className="justify-end gap-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('common.saving')}
                </>
              ) : (
                t('common.save')
              )}
            </Button>
          </DirectionalFlex>
        </form>
      </Card>
    </DirectionalContainer>
  );
}