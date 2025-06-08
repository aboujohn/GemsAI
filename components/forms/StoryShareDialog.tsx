'use client';

import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Share2,
  Copy,
  Mail,
  Globe,
  Users,
  Clock,
  Lock,
  Check,
  X,
  Plus,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StoryShareDialogProps {
  storyId: string;
  storyTitle: string;
  isPublic?: boolean;
  onShare?: (shareData: ShareData) => Promise<void>;
  children?: React.ReactNode;
}

export interface ShareData {
  shareType: 'public' | 'private' | 'temporary';
  shareWith: string[];
  message: string;
  expiresIn?: number; // days
}

export default function StoryShareDialog({
  storyId,
  storyTitle,
  isPublic = false,
  onShare,
  children,
}: StoryShareDialogProps) {
  const { t } = useTranslation(['story', 'common']);

  // State
  const [isOpen, setIsOpen] = useState(false);
  const [shareType, setShareType] = useState<'public' | 'private' | 'temporary'>('public');
  const [shareWith, setShareWith] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [message, setMessage] = useState('');
  const [expiresIn, setExpiresIn] = useState(7);
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Add email to share list
  const addEmail = useCallback(() => {
    if (newEmail && !shareWith.includes(newEmail)) {
      setShareWith(prev => [...prev, newEmail]);
      setNewEmail('');
    }
  }, [newEmail, shareWith]);

  // Remove email from share list
  const removeEmail = useCallback((email: string) => {
    setShareWith(prev => prev.filter(e => e !== email));
  }, []);

  // Handle share
  const handleShare = useCallback(async () => {
    if (!onShare) return;

    setIsSharing(true);
    try {
      const shareData: ShareData = {
        shareType,
        shareWith: shareType === 'private' ? shareWith : [],
        message,
        expiresIn: shareType === 'temporary' ? expiresIn : undefined,
      };

      await onShare(shareData);

      // Generate share URL (this would come from the API response)
      const baseUrl = window.location.origin;
      setShareUrl(`${baseUrl}/stories/${storyId}`);
    } catch (error) {
      console.error('Failed to share story:', error);
    } finally {
      setIsSharing(false);
    }
  }, [onShare, shareType, shareWith, message, expiresIn, storyId]);

  // Copy URL to clipboard
  const copyToClipboard = useCallback(async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  }, [shareUrl]);

  // Share via email
  const shareViaEmail = useCallback(() => {
    if (!shareUrl) return;

    const subject = encodeURIComponent(t('storyShare.emailSubject', { title: storyTitle }));
    const body = encodeURIComponent(`${message}\n\n${t('storyShare.emailBody')}\n${shareUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  }, [shareUrl, storyTitle, message, t]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            {t('common.share')}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            {t('storyShare.title')}
          </DialogTitle>
          <DialogDescription>
            {t('storyShare.description', { title: storyTitle })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Share Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">{t('storyShare.shareType')}</Label>
            <div className="grid gap-3">
              <Card
                className={cn(
                  'cursor-pointer transition-colors',
                  shareType === 'public' && 'ring-2 ring-primary'
                )}
                onClick={() => setShareType('public')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-green-500" />
                    <div className="flex-1">
                      <h4 className="font-medium">{t('storyShare.types.public.title')}</h4>
                      <p className="text-sm text-muted-foreground">
                        {t('storyShare.types.public.description')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className={cn(
                  'cursor-pointer transition-colors',
                  shareType === 'private' && 'ring-2 ring-primary'
                )}
                onClick={() => setShareType('private')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-blue-500" />
                    <div className="flex-1">
                      <h4 className="font-medium">{t('storyShare.types.private.title')}</h4>
                      <p className="text-sm text-muted-foreground">
                        {t('storyShare.types.private.description')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className={cn(
                  'cursor-pointer transition-colors',
                  shareType === 'temporary' && 'ring-2 ring-primary'
                )}
                onClick={() => setShareType('temporary')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-orange-500" />
                    <div className="flex-1">
                      <h4 className="font-medium">{t('storyShare.types.temporary.title')}</h4>
                      <p className="text-sm text-muted-foreground">
                        {t('storyShare.types.temporary.description')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Private Share - Email List */}
          {shareType === 'private' && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">{t('storyShare.shareWith')}</Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder={t('storyShare.emailPlaceholder')}
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && addEmail()}
                />
                <Button onClick={addEmail} size="sm" disabled={!newEmail}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {shareWith.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {shareWith.map(email => (
                    <Badge key={email} variant="secondary" className="flex items-center gap-1">
                      {email}
                      <button onClick={() => removeEmail(email)} className="ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Temporary Share - Expiration */}
          {shareType === 'temporary' && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('storyShare.expiresIn')}</Label>
              <Select value={expiresIn.toString()} onValueChange={v => setExpiresIn(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">{t('storyShare.expiration.1day')}</SelectItem>
                  <SelectItem value="3">{t('storyShare.expiration.3days')}</SelectItem>
                  <SelectItem value="7">{t('storyShare.expiration.1week')}</SelectItem>
                  <SelectItem value="30">{t('storyShare.expiration.1month')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Message */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('storyShare.message')}</Label>
            <Textarea
              placeholder={t('storyShare.messagePlaceholder')}
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {message.length}/500 {t('common.characters')}
            </p>
          </div>

          {/* Share URL (after sharing) */}
          {shareUrl && (
            <div className="space-y-3">
              <Separator />
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t('storyShare.shareUrl')}</Label>
                <div className="flex gap-2">
                  <Input value={shareUrl} readOnly className="flex-1" />
                  <Button
                    onClick={copyToClipboard}
                    size="sm"
                    variant="outline"
                    className={cn(copySuccess && 'text-green-600')}
                  >
                    {copySuccess ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                {copySuccess && <p className="text-sm text-green-600">{t('storyShare.copied')}</p>}
              </div>

              <div className="flex gap-2">
                <Button onClick={shareViaEmail} variant="outline" size="sm" className="flex-1">
                  <Mail className="h-4 w-4 mr-2" />
                  {t('storyShare.shareViaEmail')}
                </Button>
                <Button
                  onClick={() => window.open(shareUrl, '_blank')}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {t('storyShare.openStory')}
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button onClick={() => setIsOpen(false)} variant="outline" className="flex-1">
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleShare}
              disabled={isSharing || (shareType === 'private' && shareWith.length === 0)}
              className="flex-1"
            >
              {isSharing ? (
                <>
                  <Share2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('common.sharing')}...
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4 mr-2" />
                  {t('common.share')}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
