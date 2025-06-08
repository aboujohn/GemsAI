import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Speech-to-Text Demo | GemsAI',
  description: 'Advanced voice transcription capabilities for GemsAI story capture',
};

export default function TranscriptionDemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        />
        <style>{`
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.5;
            color: #0f172a;
            background-color: #ffffff;
          }
          
          .dark {
            color: #f8fafc;
            background-color: #0f172a;
          }
        `}</style>
      </head>
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
