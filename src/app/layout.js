import './globals.css';
import { AuthProvider } from '@/lib/auth';

export const metadata = {
  title: 'Blues for Volleyball Academy',
  description: 'Police Club - Maldives Police Service',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
