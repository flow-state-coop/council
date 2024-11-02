import { useQuery, gql } from "@apollo/client";
import { Network } from "@/types/network";
import { getApolloClient } from "@/lib/apollo";

const COUNCIL_QUERY = gql`
  query CouncilNameAndGrantees($council: String) {
    council(id: $council) {
      councilName
      councilSymbol
      pool
      councilMembers {
        account
        votingPower
        enabled
      }
      grantees {
        name
        account
        enabled
      }
      maxAllocationsPerMember
    }
  }
`;

export default function useCouncilQuery(network: Network) {
  const { data: councilQueryRes } = useQuery(COUNCIL_QUERY, {
    client: getApolloClient("council", network.id),
    variables: {
      council: network.councilAddress.toLowerCase(),
    },
    pollInterval: 10000,
  });

  return councilQueryRes?.council;
}
