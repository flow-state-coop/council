import { useQuery, gql } from "@apollo/client";
import { Network } from "@/types/network";
import { getApolloClient } from "@/lib/apollo";

const COUNCIL_QUERY = gql`
  query CouncilNameAndGrantees($council: String) {
    council(id: $council) {
      councilName
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

const FLOWSTATE_QUERY = gql`
  query FlowStateProfiles($profileIds: [String!]) {
    profiles(filter: { id: { in: $profileIds } }) {
      id
      metadata
    }
  }
`;

const SUPERFLUID_QUERY = gql`
  query GDAPoolQuery($gdaPool: String) {
    pool(id: $gdaPool) {
      flowRate
      adjustmentFlowRate
      totalAmountFlowedDistributedUntilUpdatedAt
      updatedAtTimestamp
      totalUnits
      poolMembers {
        account {
          id
        }
        units
        updatedAtTimestamp
        totalAmountReceivedUntilUpdatedAt
      }
      poolDistributors {
        account {
          id
        }
        flowRate
        totalAmountFlowedDistributedUntilUpdatedAt
        updatedAtTimestamp
      }
    }
  }
`;

export default function useCouncil(network: Network) {
  const { data: councilQueryRes } = useQuery(COUNCIL_QUERY, {
    client: getApolloClient("council", network.id),
    variables: {
      council: network.councilAddress.toLowerCase(),
    },
  });
  const { data: flowStateQueryRes } = useQuery(FLOWSTATE_QUERY, {
    client: getApolloClient("flowState"),
    variables: {
      profileIds: councilQueryRes?.council?.grantees.map(
        (grantee: { name: string }) => grantee.name,
      ),
    },
    skip: !councilQueryRes?.council?.grantees,
    pollInterval: 10000,
  });
  const { data: superfluidQueryRes } = useQuery(SUPERFLUID_QUERY, {
    client: getApolloClient("superfluid", network.id),
    variables: {
      gdaPool: councilQueryRes?.council.pool,
    },
    skip: !councilQueryRes?.council,
    pollInterval: 10000,
  });

  return {
    council: councilQueryRes?.council,
    flowStateProfiles: flowStateQueryRes?.profiles,
    gdaPool: superfluidQueryRes?.pool,
  };
}
