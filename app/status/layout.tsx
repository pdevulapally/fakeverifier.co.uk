import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'System Status | FakeVerifier',
  description: 'Check the current status of FakeVerifier services',
};

export default function StatusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

