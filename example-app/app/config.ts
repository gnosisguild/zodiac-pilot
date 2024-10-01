import { getDefaultConfig } from "connectkit";
import { createConfig, http } from "wagmi";
import { mainnet } from "wagmi/chains";

export const config = (projectId: string) =>
  createConfig(
    getDefaultConfig({
      appName: "Zodiac Pilot Example App",
      walletConnectProjectId: projectId,
      chains: [mainnet],
      transports: {
        [mainnet.id]: http(),
      },
    })
  );
