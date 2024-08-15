import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fuck Programming",
  description: "Become rage on hard things.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
