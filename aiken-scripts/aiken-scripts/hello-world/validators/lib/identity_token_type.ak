use aiken/crypto.{VerificationKeyHash}
use cardano/transaction.{Datum, InlineDatum} as tx

pub type Action {
  CheckMint
  CheckBurn
}

pub type ContributerDatum {
  github: String,
  contributions: List<Contribution>,
}

pub type Contribution {
  all_signatories: List<VerificationKeyHash>,
  reward: Int,
}

pub fn to_contributer_datum(data: Datum) -> ContributerDatum {
  expect InlineDatum(my_datum) = data
  expect contributer_datum: ContributerDatum = my_datum
  contributer_datum
}
