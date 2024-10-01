import { json, Links, Meta, Scripts, useLoaderData } from "@remix-run/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitButton, ConnectKitProvider } from "connectkit";
import { WagmiProvider } from "wagmi";
import { config } from "./config";

export const loader = () => json({ projectId: process.env.PROJECT_ID });

export const queryClient = new QueryClient();

export default function App() {
  const { projectId } = useLoaderData<typeof loader>();

  return (
    <html>
      <head>
        <link rel="icon" href="data:image/x-icon;base64,AA" />
        <Meta />
        <Links />
      </head>
      <body>
        <WagmiProvider config={config(projectId)}>
          <QueryClientProvider client={queryClient}>
            <ConnectKitProvider>
              <h1>Hello world!</h1>
              <ConnectKitButton />
            </ConnectKitProvider>
          </QueryClientProvider>
        </WagmiProvider>

        <Scripts />
      </body>
    </html>
  );
}
