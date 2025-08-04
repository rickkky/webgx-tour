export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='absolute overflow-hidden inset-0 w-full h-full'>
      {children}
    </div>
  );
}
