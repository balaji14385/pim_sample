import "./globals.css";
import AppLayout from "./component/AppLayout";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
    >
      <body className="min-h-full flex flex-col">
        
          <AppLayout>
          {children}
        </AppLayout>
        </body>
    </html>
  );
}
