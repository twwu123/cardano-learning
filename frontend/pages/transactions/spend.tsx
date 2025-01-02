import {
  applyCborEncoding,
  BlockfrostProvider,
  BrowserWallet,
  mConStr0,
  MeshTxBuilder,
} from "@meshsdk/core";

export const spendExample = async (wallet: BrowserWallet) => {
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
  });

  // Get utxos from wallet, with selection
  const inputUtxos = await wallet?.getUtxos();
  const collateral = (await wallet.getCollateral())[0];

  if (!inputUtxos) {
    alert(
      "Utxo selection failed, either wallet has insufficient funds, or something went wrong"
    );
    return;
  }

  const script = applyCborEncoding(
    "5857010100323232323225333002323232323253330073370e900118041baa00113233224a260160026016601800260126ea800458c024c02800cc020008c01c008c01c004c010dd50008a4c26cacae6955ceaab9e5742ae89"
  );

  // Get change address from wallet
  const changeAddress = await wallet.getChangeAddress();

  // Send 2 ADA back to our change address
  await txBuilder
    .spendingPlutusScriptV3()
    .txIn("481557963e5b36862b0bac60a37a1e8072ba503788c276e24e9b908607c1a0fe", 0)
    .txInInlineDatumPresent()
    .txInRedeemerValue(mConStr0([]))
    .txInScript(script)
    .txIn(inputUtxos[0].input.txHash, inputUtxos[0].input.outputIndex)
    .txInCollateral(
      collateral.input.txHash,
      collateral.input.outputIndex,
      collateral.output.amount,
      collateral.output.address
    )
    .changeAddress(changeAddress)
    .complete();

  // Complete the signing process in the browser wallet
  try {
    const signedTx = await wallet.signTx(txBuilder.txHex);
    console.log(signedTx);
  } catch (err) {
    console.log(err);
  }
};
