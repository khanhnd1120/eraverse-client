import {
  Aptos,
  AptosConfig,
  Deserializer,
  KeylessAccount,
} from "@aptos-labs/ts-sdk";
import api from "./api";
import myState from "./my-state";

const DefaultHeaders = {
  "Content-Type": "application/json",
};
export const DefaultOptions = {
  headers: DefaultHeaders,
};

export const queryUserNfts = async ({ owner, offset, limit }: any) => {
  const config = await nftCollectionsConfigs();

  offset = offset || 0;
  limit = limit || 10;

  const orQuery = config.collections?.map((collection: any) => ({
    current_token_data: {
      collection_id: {
        _eq: collection.id,
      },
    },
  }));

  const variables = {
    where_condition: {
      _and: [
        { owner_address: { _eq: owner } },
        { _or: orQuery },
        { amount: { _gt: 0 } },
      ],
    },

    offset,
    limit,
    order_by: [{ last_transaction_version: "desc" }, { token_data_id: "desc" }],
  };

  const data = {
    query: QueryTokenOwnershipV2,
    variables,
    operationName: "getOwnedTokens",
  };

  const url = `https://api.${config.network}.aptoslabs.com/v1/graphql/`;
  const resp = await api.aptosPost(url, data);

  if (!resp.data?.current_token_ownerships_v2) {
    throw new Error("Error on query user NFTs");
  }

  return resp.data.current_token_ownerships_v2;
};

export const nftCollectionsConfigs = async () => {
  const response = await api.eragonGet(
    "/chains/common-config?config=NFT_COLLECTIONS"
  );
  return response.data;
};

export const QueryTokenOwnershipV2 = `
query getOwnedTokens($where_condition: current_token_ownerships_v2_bool_exp!, $offset: Int, $limit: Int, $order_by: [current_token_ownerships_v2_order_by!]) {
  current_token_ownerships_v2(
    where: $where_condition
    offset: $offset
    limit: $limit
    order_by: $order_by
  ) {
    ...CurrentTokenOwnershipFields
  }
}

fragment CurrentTokenOwnershipFields on current_token_ownerships_v2 {
  token_standard
  token_properties_mutated_v1
  token_data_id
  table_type_v1
  storage_id
  property_version_v1
  owner_address
  last_transaction_version
  last_transaction_timestamp
  is_soulbound_v2
  is_fungible_v2
  amount
  current_token_data {
    collection_id
    description
    is_fungible_v2
    largest_property_version_v1
    last_transaction_timestamp
    last_transaction_version
    maximum
    supply
    token_data_id
    token_name
    token_properties
    token_standard
    token_uri
    current_collection {
      collection_id
      collection_name
      creator_address
      current_supply
      description
      last_transaction_timestamp
      last_transaction_version
      max_supply
      mutable_description
      mutable_uri
      table_handle_v1
      token_standard
      total_minted_v2
      uri
    }
  }
}

`;

export async function getPlayerHolderAddr(owner: any) {
  try {
    const GAME_CONTRACT_ADDR = await getContractGame();
    const aptos = await getAptos();
    const payload: any = {
      function: `${GAME_CONTRACT_ADDR}::eragon_asset::get_player_holder_asset`,
      typeArguments: [],
      functionArguments: [owner],
    };
    const resp = await aptos.view({ payload: payload });
    if (!resp || !resp.length) return "0x0";
    return resp[0];
  } catch (error) {
    console.log("[rollAptosProfile] ERR", error);
  }
}

async function getAptos() {
  const config = await commonConfigGameContract();
  const aptos = new Aptos(
    new AptosConfig({
      network: config.network,
      clientConfig: {
        WITH_CREDENTIALS: false,
      },
    })
  );
  return aptos;
}

const getContractGame = async () => {
  const config = await commonConfigGameContract();
  return config?.assetContract;
};

export const commonConfigGameContract = async () => {
  if (sessionStorage.getItem("ERAVERSE_COMMON_CONFIG_GAME_CONTRACT")) {
    return JSON.parse(
      sessionStorage.getItem("ERAVERSE_COMMON_CONFIG_GAME_CONTRACT")
    );
  }
  const response = await api.eragonGet(
    "/chains/common-config?config=RANDOMNESS_GAME_CONTRACT"
  );
  sessionStorage.setItem(
    "ERAVERSE_COMMON_CONFIG_GAME_CONTRACT",
    JSON.stringify(response.data)
  );

  return response.data;
};

export const fetchKeylessAccount = async () => {
  let data: string = localStorage.getItem("keyless_account_key");
  if (data) {
    // @ts-ignore
    const keylessAccountData = new Uint8Array(data?.split(","));
    let deserializer = new Deserializer(keylessAccountData);
    let keylessAccountRes = KeylessAccount.deserialize(deserializer);
    myState.keylessAccountData$.next(keylessAccountRes);
  }
};
