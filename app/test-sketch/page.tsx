'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function TestSketch() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Test Page</CardTitle>
        </CardHeader>
        <CardContent>
          <Button>Test Button</Button>
          <p>This page tests basic components without SketchViewer</p>
        </CardContent>
      </Card>
    </div>
  );
} 