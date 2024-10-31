import { Network } from "@/types/network";

const networks: Network[] = [
  /*
  {
    id: 8453,
    name: "Base",
    icon: "/base.svg",
    blockExplorer: "https://basescan.org/",
    rpcUrl: "https://base-rpc.publicnode.com",
    councilSubgraph:
      "https://api.goldsky.com/api/public/project_cm10r8z66lbri01se6301ddxj/subgraphs/councilhaus-base/0.0.2/gn",
    superfluidExplorer: "https://explorer.superfluid.finance/base-mainnet",
    superfluidDashboard: "https://app.superfluid.finance",
    superfluidSubgraph:
      "https://subgraph-endpoints.superfluid.dev/base-mainnet/protocol-v1",
    onRampName: "BASE_ETH",
    superfluidHost: "0x4C073B3baB6d8826b8C5b229f3cfdC1eC6E47E74",
    superfluidResolver: "0x6a214c324553F96F04eFBDd66908685525Da0E0d",
    gdaForwarder: "0x6DA13Bde224A05a288748d857b9e7DDEffd1dE08",
    tokens: [
    ],
  },
  */
  {
    id: 11155420,
    name: "OP Sepolia",
    icon: "/optimism.svg",
    rpcUrl: "https://optimism-sepolia-rpc.publicnode.com",
    blockExplorer: "https://sepolia-optimism.etherscan.io",
    councilAddress: "0x4F2289c1719a2DaF0a38B1983265eC848aFCd36e",
    councilSubgraph:
      "https://api.goldsky.com/api/public/project_cm2vlxq9s82qo01xtc11y9stm/subgraphs/flowstate-council-optimism-sepolia/0.0.2/gn",
    superfluidExplorer: "https://explorer.superfluid.finance/optimism-sepolia",
    superfluidDashboard: "https://app.superfluid.finance",
    superfluidSubgraph:
      "https://subgraph-endpoints.superfluid.dev/optimism-sepolia/protocol-v1",
    onRampName: "OPTIMISM_ETH",
    superfluidHost: "0xd399e2Fb5f4cf3722a11F65b88FAB6B2B8621005",
    superfluidResolver: "0x554c06487bEc8c890A0345eb05a5292C1b1017Bd",
    gdaForwarder: "0x6DA13Bde224A05a288748d857b9e7DDEffd1dE08",
    tokens: [
      {
        name: "fDAIx",
        address: "0xD6FAF98BeFA647403cc56bDB598690660D5257d2",
        icon: "/dai.svg",
      },
    ],
  },
];

export { networks };
