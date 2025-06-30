export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className='absolute inset-0 w-full h-full'>{children}</div>;
}
