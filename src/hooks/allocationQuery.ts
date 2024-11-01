import { useQuery, gql } from "@apollo/client";
import { Network } from "@/types/network";
import { getApolloClient } from "@/lib/apollo";

const ALLOCATION_QUERY = gql`
  query AllocationQuery($council: String, $councilMember: String) {
    councilMember(id: $councilMember) {
      votingPower
    }
    allocations(
      first: 1
      where: { council: $council, councilMember: $councilMember }
      orderBy: allocatedAt
      orderDirection: desc
    ) {
      grantees {
        account
      }
      amounts
    }
  }
`;

export default function useAllocationQuery(network: Network, address: string) {
  const councilAddress = network.councilAddress.toLowerCase();

  const { data: allocationQueryRes } = useQuery(ALLOCATION_QUERY, {
    client: getApolloClient("council", network.id),
    variables: {
      council: councilAddress,
      councilMember: `${councilAddress}-${address.toLowerCase()}`,
    },
    skip: !address,
    pollInterval: 10000,
  });
  const currentAllocation = allocationQueryRes?.allocations[0];
  const allocation = currentAllocation?.grantees.map(
    (grantee: { account: string }, i: number) => {
      return {
        grantee: grantee.account,
        amount: Number(currentAllocation.amounts[i]),
      };
    },
  );
  const votingPower = allocationQueryRes?.councilMember?.votingPower;

  return {
    allocation,
    votingPower,
  };
}
