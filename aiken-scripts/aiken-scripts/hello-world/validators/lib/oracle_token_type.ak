use aiken/cbor
use cardano/address.{Address, from_script}
use cardano/assets.{PolicyId}
use mocktail/virgin_address.{mock_pub_key_address}

pub type Action {
  CheckMint
  CheckBurn
}

pub type OracleDatum {
  bounty_token_policy_id: PolicyId,
  bounty_board_address: Address,
  id_token_policy_id: PolicyId,
  id_token_store_address: Address,
  owner: Address,
}

pub type OracleCounterDatum {
  count: Int,
  owner: Address,
}

pub type OracleRedeemer {
  MintNFT
  StopOracle
}

test oracle_datum() {
  let datum: OracleDatum =
    OracleDatum {
      bounty_token_policy_id: "abc",
      bounty_board_address: from_script(
        #"91f740da89f81ef5e99264e2c482f96be96ceab7f9e47907f414db9b",
      ),
      id_token_policy_id: #"264b8d5c046b8226ba104011ca8157650051b748274756318513b03c",
      id_token_store_address: from_script(
        #"91f740da89f81ef5e99264e2c482f96be96ceab7f9e47907f414db9b",
      ),
      owner: mock_pub_key_address(0, None),
    }

  cbor.serialise(datum) != #"d8799f43616263d8799fd87a9f43616263ffd87a80ff43646566d8799fd87a9f43646566ffd87a80ffff"
}
