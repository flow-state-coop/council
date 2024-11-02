import { createGuildClient } from "@guildxyz/sdk";
import {
  parseAbi,
  createPublicClient,
  createWalletClient,
  http,
  encodeFunctionData,
  Chain,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { optimismSepolia } from "wagmi/chains";
import { networks } from "@/lib/networks";

export const dynamic = "force-dynamic";

const GUILD_ID = 75081;
const ROLE_ID = 149679;

const councilContractAddresses: { [id: number]: `0x${string}` } = {
  11155420: "0x4F2289c1719a2DaF0a38B1983265eC848aFCd36e",
};

const chains: { [id: number]: Chain } = {
  11155420: optimismSepolia,
};

export async function POST(request: Request) {
  try {
    const { address, profileId, chainId } = await request.json();

    const guildClient = createGuildClient("SQF");
    const { user: userClient } = guildClient;

    const userMemberships = await userClient.getMemberships(address);
    const guildMembership = userMemberships?.find(
      (membership) => membership.guildId === GUILD_ID,
    );
    const hasRole =
      guildMembership && guildMembership.roleIds.includes(ROLE_ID)
        ? true
        : false;

    if (!hasRole) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Address has no role in guild",
        }),
      );
    }

    const network = networks.find((network) => network.id === chainId);

    if (!network) {
      return new Response(
        JSON.stringify({ success: false, error: "Wrong network" }),
      );
    }

    const walletClient = createWalletClient({
      chain: chains[network.id],
      transport: http(network.rpcUrl),
    });
    const publicClient = createPublicClient({
      chain: chains[network.id],
      transport: http(network.rpcUrl),
    });
    const account = privateKeyToAccount(
      process.env.COUNCIL_ADMIN_PK as `0x${string}`,
    );

    const councilContractAddress = councilContractAddresses[network.id];

    if (!councilContractAddress) {
      return new Response(
        JSON.stringify({ success: false, error: "Council contract not found" }),
      );
    }

    const hash = await walletClient.sendTransaction({
      account,
      to: councilContractAddress,
      data: encodeFunctionData({
        abi: parseAbi([
          "function addGrantee(string memory _name, address _grantee) public",
        ]),
        functionName: "addGrantee",
        args: [profileId, address],
      }),
    });

    await publicClient.waitForTransactionReceipt({ hash, confirmations: 3 });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Grantee successfully added, transaction hash: ${hash}`,
      }),
    );
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err }));
  }
}
