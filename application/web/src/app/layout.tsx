import type { Metadata } from "next";

import { ChakraProvider } from '@chakra-ui/react'
import type {ReactNode} from "react";

export const metadata: Metadata = {
  title: "Fuck Programming",
  description: "Become rage on hard things.",
};

export default function RootLayout({
  children,
  signup
}: Readonly<{
  children: ReactNode;
  signup: ReactNode
}>) {
  return (
    <html lang="en">
      <body>
      <ChakraProvider>
              {children}
                {signup}
      </ChakraProvider>
      </body>
    </html>
  );
}
