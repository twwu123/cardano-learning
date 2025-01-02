use aiken/crypto.{VerificationKeyHash}
use aiken/collection/list
use cardano/assets.{AssetName, PolicyId, quantity_of}
use cardano/transaction.{DatumHash, InlineDatum, Input, NoDatum}
use bounty_token_type.{BountyDatum}

pub fn has_all_signers(
  all_signers: List<VerificationKeyHash>,
  actual_signers: List<VerificationKeyHash>,
) -> Bool {
  when all_signers is {
    [] -> True
    [head, ..tail] ->
      if !list.has(actual_signers, head) {
        False
      } else {
        has_all_signers(tail, actual_signers)
      }
  }
}

