import {
  ApolloClient,
  ApolloClientOptions,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client";
import { networks } from "@/lib/networks";

type ApiType = "flowState" | "superfluid" | "council";

const apolloClient: ApolloClientOptions<NormalizedCacheObject> = {
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      errorPolicy: "all",
    },
    watchQuery: {
      errorPolicy: "all",
    },
  },
};

const flowStateClient = new ApolloClient(apolloClient);
const superfluidClient = new ApolloClient(apolloClient);
const councilClient = new ApolloClient(apolloClient);

export const getApolloClient = (type: ApiType, chainId?: number) => {
  flowStateClient.setLink(
    new HttpLink({ uri: "https://api.flowstate.network/graphql" }),
  );

  if (chainId) {
    const network = networks.find((network) => network.id === chainId);

    if (!network) {
      throw Error("Network not found");
    }

    superfluidClient.setLink(new HttpLink({ uri: network.superfluidSubgraph }));
    councilClient.setLink(new HttpLink({ uri: network.councilSubgraph }));
  }

  const client =
    type === "flowState"
      ? flowStateClient
      : type === "superfluid"
        ? superfluidClient
        : councilClient;

  return client;
};
