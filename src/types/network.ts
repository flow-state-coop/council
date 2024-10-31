import { Address } from "viem";
import { Token } from "@/types/token";

export type Network = {
  id: number;
  name: string;
  icon: string;
  rpcUrl: string;
  blockExplorer: string;
  councilAddress: string;
  councilSubgraph: string;
  superfluidExplorer: string;
  superfluidDashboard: string;
  superfluidSubgraph: string;
  onRampName: string;
  superfluidHost: Address;
  superfluidResolver: Address;
  tokens: Token[];
  gdaForwarder: Address;
};
