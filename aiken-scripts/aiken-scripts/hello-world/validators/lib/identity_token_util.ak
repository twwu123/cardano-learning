use aiken/collection/list
use cardano/assets.{AssetName, PolicyId, quantity_of}
use cardano/transaction.{DatumHash, InlineDatum, Input, NoDatum}
use identity_token_type.{ContributerDatum}
use mocktail/virgin_key_hash.{mock_pub_key_hash}

pub fn get_contributer_datum(
  inputs: List<Input>,
  id_nft: (PolicyId, AssetName),
) -> ContributerDatum {
  expect Some(contributer_input) =
    inputs
      |> list.find(
          fn(input) {
            quantity_of(input.output.value, id_nft.1st, id_nft.2nd) == 1
          },
        )

  let contributer_input_data: Data =
    when contributer_input.output.datum is {
      NoDatum -> fail @"input does not contain any datum"
      DatumHash(_) -> fail @"input datum must be inlined"
      InlineDatum(data) -> data
    }

  expect contributer_input_datum: ContributerDatum = contributer_input_data
  contributer_input_datum
}

pub fn has_all_signers(
  all_signers: List<ByteArray>,
  actual_signers: List<ByteArray>,
) -> Bool {
  when all_signers is {
    [] -> True
    [head, ..tail] ->
      if list.has(actual_signers, head) {
        if list.length(tail) == 1 {
          expect Some(last) = list.head(tail)
          if list.has(actual_signers, last) {
            True
          } else {
            False
          }
        } else {
          has_all_signers(tail, actual_signers)
        }
      } else {
        False
      }
  }
}

test address_check() {
  let all_signers: List<ByteArray> =
    [
      mock_pub_key_hash(3),
      mock_pub_key_hash(2),
      mock_pub_key_hash(1),
      mock_pub_key_hash(0),
    ]
  let actual_signers: List<ByteArray> =
    [
      mock_pub_key_hash(0),
      mock_pub_key_hash(1),
      mock_pub_key_hash(2),
      mock_pub_key_hash(3),
    ]
  has_all_signers(all_signers: all_signers, actual_signers: actual_signers)
}
