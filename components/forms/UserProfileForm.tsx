'use client';

import React, { useState, useRef } from 'react';
import { useAuth, useUserProfile } from '@/lib/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Camera, Save, AlertCircle, CheckCircle, Upload, X, Edit } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase/client';

// Form validation schema
const profileSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name too long'),
  phone: z
    .string()
    .optional()
    .refine(val => {
      if (!val) return true;
      return /^[\+]?[1-9][\d]{0,15}$/.test(val);
    }, 'Please enter a valid phone number'),
  language_preference: z.enum(['en', 'he']),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  location: z.string().max(100, 'Location must be less than 100 characters').optional(),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface UserProfileFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
}

export function UserProfileForm({ onSuccess, onCancel, showCancel = false }: UserProfileFormProps) {
  const { user } = useAuth();
  const { updateUserProfile, updating, updateError } = useUserProfile();
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.profile?.full_name || '',
      phone: user?.profile?.phone || '',
      language_preference: (user?.profile?.language_preference as 'en' | 'he') || 'he',
      bio: user?.profile?.bio || '',
      location: user?.profile?.location || '',
      website: user?.profile?.website || '',
    },
  });

  // Update form when user data changes
  React.useEffect(() => {
    if (user?.profile) {
      setValue('full_name', user.profile.full_name || '');
      setValue('phone', user.profile.phone || '');
      setValue('language_preference', (user.profile.language_preference as 'en' | 'he') || 'he');
      setValue('bio', user.profile.bio || '');
      setValue('location', user.profile.location || '');
      setValue('website', user.profile.website || '');
    }
  }, [user, setValue]);

  const getInitials = (name?: string) => {
    if (!name) return user?.email?.charAt(0).toUpperCase() || 'U';
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      setAvatarError('Image must be less than 5MB');
      return;
    }

    try {
      setAvatarUploading(true);
      setAvatarError(null);

      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('user-uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('user-uploads').getPublicUrl(filePath);

      // Update user profile with new avatar URL
      await updateUserProfile({ avatar_url: publicUrl });

      console.log('Avatar uploaded successfully');
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      setAvatarError(error.message || 'Failed to upload avatar');
      setPreviewUrl(null);
    } finally {
      setAvatarUploading(false);
    }
  };

  const removeAvatar = async () => {
    try {
      setAvatarUploading(true);
      await updateUserProfile({ avatar_url: null });
      setPreviewUrl(null);
    } catch (error: any) {
      setAvatarError(error.message || 'Failed to remove avatar');
    } finally {
      setAvatarUploading(false);
    }
  };

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      await updateUserProfile(data);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
      onSuccess?.();
    } catch (error) {
      console.error('Profile update failed:', error);
    }
  };

  const handleCancel = () => {
    reset();
    setPreviewUrl(null);
    setAvatarError(null);
    onCancel?.();
  };

  const currentAvatarUrl = previewUrl || user?.profile?.avatar_url;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="h-5 w-5 mr-2" />
          Profile Information
        </CardTitle>
        <CardDescription>Update your personal information and preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src={currentAvatarUrl} alt="Profile picture" />
              <AvatarFallback className="text-lg">{getInitials(watch('full_name'))}</AvatarFallback>
            </Avatar>

            {avatarUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
              >
                <Camera className="h-4 w-4 mr-2" />
                {currentAvatarUrl ? 'Change' : 'Upload'} Photo
              </Button>

              {currentAvatarUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={removeAvatar}
                  disabled={avatarUploading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              )}
            </div>

            <p className="text-xs text-gray-500">JPG, PNG or GIF. Max size 5MB.</p>

            {avatarError && <p className="text-xs text-red-500 mt-1">{avatarError}</p>}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full_name">Full Name *</Label>
              <Input id="full_name" {...register('full_name')} placeholder="Enter your full name" />
              {errors.full_name && (
                <p className="text-sm text-red-500 mt-1">{errors.full_name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="Enter your phone number"
                dir="ltr"
              />
              {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="language_preference">Language Preference</Label>
              <Select
                value={watch('language_preference')}
                onValueChange={(value: 'en' | 'he') => setValue('language_preference', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="he">עברית (Hebrew)</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" {...register('location')} placeholder="City, Country" />
              {errors.location && (
                <p className="text-sm text-red-500 mt-1">{errors.location.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              {...register('website')}
              placeholder="https://your-website.com"
              dir="ltr"
            />
            {errors.website && (
              <p className="text-sm text-red-500 mt-1">{errors.website.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              {...register('bio')}
              placeholder="Tell us about yourself..."
              rows={3}
              className="resize-none"
            />
            <div className="flex justify-between items-center mt-1">
              {errors.bio && <p className="text-sm text-red-500">{errors.bio.message}</p>}
              <p className="text-xs text-gray-500 ml-auto">{watch('bio')?.length || 0}/500</p>
            </div>
          </div>

          {/* Read-only fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email || ''}
                disabled
                className="bg-gray-50 dark:bg-gray-800"
              />
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed. Contact support if needed.
              </p>
            </div>

            <div>
              <Label htmlFor="role">Account Type</Label>
              <div className="flex items-center h-10">
                <Badge
                  variant={
                    user?.role === 'admin'
                      ? 'destructive'
                      : user?.role === 'jeweler'
                        ? 'default'
                        : 'secondary'
                  }
                >
                  {user?.role || 'user'}
                </Badge>
              </div>
            </div>
          </div>

          {updateError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{updateError}</AlertDescription>
            </Alert>
          )}

          {profileSuccess && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>Profile updated successfully!</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            {showCancel && (
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            )}

            <Button type="submit" disabled={updating || !isDirty} className="min-w-[120px]">
              {updating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
