import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NTA NEET CBT Online Examination Platform',
  description: 'Professional Computer-Based Test (CBT) portal for Medical & Pre-Medical Entrance Exams with automatic scoring and detailed solutions.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}

