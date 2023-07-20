import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'react-server-sent-event-manager test',
  description: 'react-server-sent-event-manager test',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>{children}</>
  );
}
