import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Curator CRM - Enterprise",
  description: "Manage your sales pipeline, leads, deals and tasks with Curator CRM",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            classNames: {
              toast: "!rounded-xl !border !border-gray-100 !shadow-lg",
            },
          }}
        />
      </body>
    </html>
  );
}
