'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { Icons } from '@/components/ui/Icons';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useTranslation } from '@/lib/hooks/useTranslation';

export default function HomePage() {
  const { t, isRTL, getDirectionalClass } = useTranslation(['common', 'stories']);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-background to-muted">
          <Container>
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-gold-500 bg-clip-text text-transparent">
                  {t('stories:hero.title')}
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  {t('stories:hero.subtitle')}
                </p>
              </div>

              <div
                className={`flex flex-col sm:flex-row gap-4 justify-center ${isRTL ? 'sm:flex-row-reverse' : ''}`}
              >
                <Button size="lg" variant="gradient">
                  <Icons.sparkles className={getDirectionalClass('mr-2', 'ml-2')} />
                  {t('stories:hero.createStory')}
                </Button>
                <Button size="lg" variant="outline">
                  <Icons.heart className={getDirectionalClass('mr-2', 'ml-2')} />
                  {t('stories:hero.viewGallery')}
                </Button>
              </div>
            </div>
          </Container>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <Container>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">{t('stories:howItWorks.title')}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t('stories:howItWorks.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card variant="elevated" className="text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icons.edit className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{t('stories:howItWorks.shareStory.title')}</CardTitle>
                  <CardDescription>
                    {t('stories:howItWorks.shareStory.description')}
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card variant="elevated" className="text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-gemstone-500/10 rounded-lg flex items-center justify-center mb-4">
                    <Icons.sparkles className="h-6 w-6 text-gemstone-500" />
                  </div>
                  <CardTitle>{t('stories:howItWorks.aiAnalysis.title')}</CardTitle>
                  <CardDescription>
                    {t('stories:howItWorks.aiAnalysis.description')}
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card variant="elevated" className="text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-gold-500/10 rounded-lg flex items-center justify-center mb-4">
                    <Icons.star className="h-6 w-6 text-gold-500" />
                  </div>
                  <CardTitle>{t('stories:howItWorks.craftJewelry.title')}</CardTitle>
                  <CardDescription>
                    {t('stories:howItWorks.craftJewelry.description')}
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </Container>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-muted/50">
          <Container>
            <Card className="p-8 md:p-12 text-center">
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold">{t('stories:cta.title')}</h2>
                  <p className="text-muted-foreground text-lg">{t('stories:cta.subtitle')}</p>
                </div>

                <div
                  className={`flex flex-col sm:flex-row gap-4 justify-center ${isRTL ? 'sm:flex-row-reverse' : ''}`}
                >
                  <Button size="lg" variant="gemstone">
                    <Icons.plus className={getDirectionalClass('mr-2', 'ml-2')} />
                    {t('stories:cta.startCreating')}
                  </Button>
                  <Button size="lg" variant="ghost">
                    <Icons.info className={getDirectionalClass('mr-2', 'ml-2')} />
                    {t('stories:cta.learnMore')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Container>
        </section>
      </main>

      <Footer />
    </div>
  );
}
