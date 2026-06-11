import "./globals.css";
import AppLayout from "./component/AppLayout";
import { ToastContainer } from "react-toastify";
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
          < ToastContainer position="top-center" limit={1}/>
          <AppLayout>
          {children}
        </AppLayout>
        </body>
    </html>
  );
}
