import { useState } from "react";
import { usePublicClient, useReadContract, useWriteContract } from "wagmi";
import { Address, parseAbi } from "viem";

export default function useGdaPoolConnection(args: {
  gdaForwarderAddress: Address;
  address: Address;
  gdaPoolAddress: Address;
}) {
  const { gdaPoolAddress, gdaForwarderAddress, address } = args;

  const [isConnectingToPool, setIsConnectingToPool] = useState(false);

  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const { data: isConnectedToPool, refetch: refetchIsConnectedToPool } =
    useReadContract({
      address: gdaForwarderAddress,
      abi: parseAbi([
        "function isMemberConnected(address, address) view returns (bool)",
      ]),
      functionName: "isMemberConnected",
      args: [gdaPoolAddress ?? "0x", address ?? "0x"],
    });

  const connectToPool = async () => {
    if (!address || !gdaPoolAddress || !publicClient) {
      return;
    }

    try {
      setIsConnectingToPool(true);

      const hash = await writeContractAsync({
        address: gdaForwarderAddress,
        abi: parseAbi(["function connectPool(address, bytes)"]),
        functionName: "connectPool",
        args: [gdaPoolAddress, "0x"],
      });

      await publicClient.waitForTransactionReceipt({ hash, confirmations: 3 });

      refetchIsConnectedToPool();

      setIsConnectingToPool(false);
    } catch (err) {
      console.error(err);

      setIsConnectingToPool(false);
    }
  };

  return { isConnectedToPool, isConnectingToPool, connectToPool };
}
