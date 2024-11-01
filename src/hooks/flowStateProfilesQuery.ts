import { useQuery, gql } from "@apollo/client";
import { Network } from "@/types/network";
import { getApolloClient } from "@/lib/apollo";

const FLOWSTATE_QUERY = gql`
  query FlowStateProfiles($profileIds: [String!]) {
    profiles(filter: { id: { in: $profileIds } }) {
      id
      metadata
    }
  }
`;

export default function useFlowStateProfilesQuery(
  network: Network,
  grantees?: { name: string }[],
) {
  const { data: flowStateQueryRes } = useQuery(FLOWSTATE_QUERY, {
    client: getApolloClient("flowState"),
    variables: {
      profileIds: grantees?.map((grantee: { name: string }) => grantee.name),
    },
    skip: !grantees || grantees.length === 0,
    pollInterval: 10000,
  });

  return flowStateQueryRes?.profiles;
}
