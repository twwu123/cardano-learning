import {
  BlockfrostProvider,
  BrowserWallet,
  MeshTxBuilder,
  resolveScriptHash,
  stringToHex,
  deserializeAddress,
  applyCborEncoding,
  CIP68_100,
  CIP68_222,
  serializePlutusScript,
  mConStr0,
  txOutRef,
  outputReference,
  mOutputReference,
  Data,
  mPubKeyAddress,
} from "@meshsdk/core";
import { applyParamsToScript, OfflineEvaluator } from "@meshsdk/core-csl";

export const mintOracleCounter = async (wallet: BrowserWallet) => {
  if (!wallet) {
    alert("Please connect your wallet");
    return;
  }
  if (!process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY) {
    alert("Please set up environment variables");
    return;
  }

  // Set up tx builder with blockfrost support
  const blockfrost: BlockfrostProvider = new BlockfrostProvider(
    process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY,
    0
  );
  const txBuilder: MeshTxBuilder = new MeshTxBuilder({
    fetcher: blockfrost,
    submitter: blockfrost,
    evaluator: new OfflineEvaluator(blockfrost, "preprod"),
  });

  const changeAddress = await wallet.getChangeAddress();
  const utxos = await wallet.getUtxos();
  const collateral = (await wallet.getCollateral())[0];
  const usedAddress = (await wallet.getUsedAddresses())[0];
  const { pubKeyHash, stakeCredentialHash } = deserializeAddress(usedAddress);

  const paramUtxo = utxos[0]!;
  const param: Data = mOutputReference(
    paramUtxo.input.txHash,
    paramUtxo.input.outputIndex
  );

  const idOracleCounterSpendingScriptCbor = applyCborEncoding(
    "590683010100323232323232323232323225333004323232323253323300a3001300c37540042646644a66666602a00c2646464a66602060060022a66602860266ea802400803854ccc040c01c00454ccc050c04cdd500480100700718089baa008132323232323232533301530083017375401226464646464a666034601a60386ea80044c8c8c8c94ccc0880040744c94ccc08cc0980084c8c8c8c8c94ccc090c05cc098dd518150010991929998150008018a999815181680089929998158008020a9998159817000899192999814a99981499b87332300100122533302f0011480004cdc024004660040046064002601a6eacc038c0b0dd500124008294454cc0a92411d69735f6f75747075745f76616c75655f636c65616e203f2046616c73650014a02a666052a666052002294454cc0a92411869735f636f756e745f75706461746564203f2046616c73650014a02a666052010294454cc0a924011769735f6f776e65725f7369676e6564203f2046616c73650014a0294052819baf302e302f302f302b375400266e9520043302d3374a9000198169ba833700024900119816808a5eb812f5c0605a0020086eb0c0b0c0b400800cdd61815800981580109929998148008010a99981498160008a999812a999812991929998158008010a999815981700089919199911299981619b8f00300d1533302c3371e00491010013370e00290008a5014a06eb8c0bc008dd718178009bad302f3030001302f0013758605a002004601402629405288a998132491b69735f6f7261636c655f6e66745f6275726e74203f2046616c73650014a02a66604a008294454cc09924011769735f6f776e65725f7369676e6564203f2046616c73650014a02940008dd6181518158010a5032323302901d33029374e660040264a66604a66ebcc034c0a0dd5180518141baa00100513300230093756601460506ea8c028c0a0dd5000919b8f375c601c00200e2940cc0a4dd3998010091299981299baf300d3028375400200a26600460126eacc028c0a0dd5000919b8f375c601c00200e29412f5c044646600200200644a66605600229404cc894ccc0a4c0140085288998020020009bac302d001302e00122323300100100322533302a00114bd70099912999814180280109981680119802002000899802002000981600098168009919198008008079129998140008a501332253330263371e00400a29444cc010010004dd718150009815800992999811180c98121baa0011375c6050604a6ea80044dd7181418129baa001300930243754014601060466ea8c014c08cdd50031bae302500101e37586048002646600200260046eacc00cc084dd5180198109baa00422533302300114bd7009991299981099981099b8f375c6012004911004a09444cc098dd3801198020020008998020020009bac302500130260012323300100100222533302300114bd7009919991119198008008019129998148008801899198159ba73302b375200c66056605000266056605200297ae033003003302d002302b001375c60440026eacc08c004cc00c00cc09c008c0940048c088c08c004c080c074dd50008a9980da493265787065637420536f6d65286f776e5f696e70757429203d2066696e645f696e70757428696e707574732c20696e707574290016323300100100922533301f00114c0103d87a800013322533301d3375e600a60406ea80080484cdd2a40006604400497ae0133004004001302100130220012301f001301d301e002375a603800260306ea8c06cc060dd50048a9980b2493c65787065637420536f6d65284f7261636c65436f756e746572446174756d207b20636f756e742c206f776e6572207d29203d20646174756d5f6f707400163758603460366036603660360086eacc06400cdd6180c0019bac30170033017301700130163016001301137540106e1d200000b00b00b00b301100130113012001300d37540046e1d200216300e300f003300d002300c002300c001300737540022930a99802a4811856616c696461746f722072657475726e65642066616c73650013656153300349011872656465656d65723a204f7261636c6552656465656d6572001615330024916e657870656374205b286f7261636c655f6e66745f706f6c6963792c205f2c205f295d203d0a2020202020206c6973742e66696c74657228666c617474656e286f776e5f696e7075742e6f75747075742e76616c7565292c20666e287829207b20782e31737420213d202222207d2900165734ae7155ceaab9e5573eae815d0aba257481"
  );

  const idOracleCounterAddress = serializePlutusScript(
    {
      code: idOracleCounterSpendingScriptCbor,
      version: "V3",
    },
    undefined,
    0
  ).address;

  const idOracleCounterMintingScriptCbor = applyParamsToScript(
    "5901e801010032323232323232323232225333004323232323253323300a3001300c3754004264a66666602600826464a66601a60080022a66602260206ea801800803054ccc034cdc3a40040022a66602260206ea8018008030030c038dd50028992999806180198071baa0051533300c3003300e375464660020026eb0c04cc040dd50039129998090008a6103d87a80001332253330103375e01c600a60266ea80084cdd2a40006602a00497ae01330040040013014001301500114a229404c8cc004004c8cc004004dd5980a180a980a980a980a98089baa00822533301300114bd70099199911191980080080191299980c80088018991980d9ba73301b375200c66036603000266036603200297ae033003003301d002301b001375c60240026eacc04c004cc00c00cc05c008c054004894ccc048004528899912999808299980819b8f375c600a00400c266e20dd6980b180b980b8012400029444cc0100100045281bac301400130150012301200100a00a00a00a375c6020601a6ea8008dc3a40002c601c601e006601a00460180046018002600e6ea800452615330054911856616c696461746f722072657475726e65642066616c73650013656153300249011072656465656d65723a20416374696f6e00165734ae7155ceaab9e5573eae815d0aba257481",
    [param]
  );

  const idOracleCounterPolicyId = resolveScriptHash(
    idOracleCounterMintingScriptCbor,
    "V3"
  );

  try {
    const unsignedTx = await txBuilder
      .txIn(
        paramUtxo.input.txHash,
        paramUtxo.input.outputIndex,
        paramUtxo.output.amount,
        paramUtxo.output.address
      )
      .mintPlutusScriptV3()
      .mint("1", idOracleCounterPolicyId, stringToHex("id_oracle_counter"))
      .mintingScript(idOracleCounterMintingScriptCbor)
      .mintRedeemerValue(
        JSON.stringify({
          constructor: 0,
          fields: [],
        }),
        "JSON"
      )
      .txOut(idOracleCounterAddress, [
        { unit: idOracleCounterPolicyId, quantity: "1" },
      ])
      .txOutInlineDatumValue(
        mConStr0([mPubKeyAddress(pubKeyHash, stakeCredentialHash)])
      )
      .txInCollateral(
        collateral.input.txHash,
        collateral.input.outputIndex,
        collateral.output.amount,
        collateral.output.address
      )
      .changeAddress(changeAddress)
      .selectUtxosFrom(utxos)
      .complete();

    const signedTx = await wallet.signTx(unsignedTx, true);
    const txHash = await wallet.submitTx(signedTx);

    console.log(unsignedTx);
    console.log(paramUtxo.input);
    console.log(txHash);
  } catch (e) {
    console.error(e);
  }
};

// JSON.stringify({
//   constructor: 0,
//   fields: [
//     {
//       bytes: stringToHex("aaa@github.com"),
//     },
//     { list: [
//       {
//         constructor: 0,
//         fields: [
//           {
//             "list": [
//               {
//                 "bytes": pubKeyHash
//               }
//             ]
//           },
//           {
//             "int": 10000
//           }
//         ]
//       }
//     ] },
//   ],
// }),
// "JSON"
// Exercise 2: Try to decode this cbor and find the following information:
// Inputs
// Outputs
// Mint
// transaction_witness_set.vkeywitness
// transaction_witness_set.native_script

// While this seems like a very simple transaction, there is actually a lot going on.
// In particular, an asset's identity is separated into two parts, something called a policy id, and the asset's name.
// Exercise 2a: Could you try and find information on what a policy id is?
// After which, try to explain concisely what the above nativeScript is doing.
