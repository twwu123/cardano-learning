import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import {
  BlockfrostProvider,
  MeshTxBuilder,
  NativeScript,
  resolveNativeScriptHash,
  resolveNativeScriptHex,
  resolvePaymentKeyHash,
} from "@meshsdk/core";
import { BrowserWallet } from "@meshsdk/core";
import { useEffect, useState } from "react";

const Home: NextPage = () => {
  const [wallet, setWallet] = useState<BrowserWallet | null>(null);

  useEffect(() => {
    connectWallet();
  }, []);

  const connectWallet = async () => {
    const eternlWallet = await BrowserWallet.enable("eternl");
    setWallet(eternlWallet);
  };

  const sendExample = async () => {
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
    const inputUtxos = await wallet?.getUtxos([
      {
        unit: "lovelace",
        quantity: "5000000",
      },
    ]);

    if (!inputUtxos) {
      alert(
        "Utxo selection failed, either wallet has insufficient funds, or something went wrong"
      );
      return;
    }

    // Add all selected inputs into the tx builder
    for (let i = 0; i < inputUtxos.length; i++) {
      const utxo = inputUtxos[i];
      txBuilder.txIn(utxo.input.txHash, utxo.input.outputIndex);
    }

    // Get change address from wallet
    const changeAddress = await wallet.getChangeAddress();

    // Send 2 ADA back to our change address
    await txBuilder
      .txOut(changeAddress, [
        {
          unit: "lovelace",
          quantity: "2000000",
        },
      ])
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

  // Exercise 1: If we set up the wallet correctly and do the signing process correctly
  // the above transaction will log a signed transaction hex. It should look something like
  // 84a50081825820e63e499549d8... This is called a CBOR hex, and it will be something we
  // must get very familiar with. Once you get this CBOR hex, I want you to decode it into something
  // human readable using https://cbor.me/.

  // The second thing I would like you to do is to find the open source repository where Cardano's
  // cddl files are stored (hint: IntersectMBO). Look through the repository to find the current active
  // cddl (the current era is named babbage).

  // These two things are also linked in the first section of the "What I wish I knew" page in the
  // Aiken documentation.

  // After which, I would like you to copy and paste from https://cbor.me/
  // the following information about the transaction here:
  // inputs:
  // outputs:
  // fee:

  const mintExample = async () => {
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
    const inputUtxos = await wallet?.getUtxos([
      {
        unit: "lovelace",
        quantity: "5000000",
      },
    ]);

    if (!inputUtxos) {
      alert(
        "Utxo selection failed, either wallet has insufficient funds, or something went wrong"
      );
      return;
    }

    // Add all selected inputs into the tx builder
    for (let i = 0; i < inputUtxos.length; i++) {
      const utxo = inputUtxos[i];
      txBuilder.txIn(utxo.input.txHash, utxo.input.outputIndex);
    }

    // Get change address from wallet
    const changeAddress = await wallet.getChangeAddress();

    // This is a very simple native script that defines the
    // minting conditions of our token
    const nativeScript: NativeScript = {
      type: "sig",
      keyHash: resolvePaymentKeyHash(changeAddress),
    };

    // Send the minted token with 2 ADA back to our change address
    await txBuilder
      .txOut(changeAddress, [
        {
          unit: "lovelace",
          quantity: "2000000",
        },
      ])
      .mint(
        "1",
        resolveNativeScriptHash(nativeScript),
        Buffer.from("TEST", "utf-8").toString("hex") // Note that asset names are base16 encoded, so we cannot just input "TEST", this results in "54455354"
      )
      .mintingScript(resolveNativeScriptHex(nativeScript))
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

  return (
    <div className={styles.container}>
      {wallet ? (
        <button className={styles.button}>Eternl Connected</button>
      ) : (
        <button className={styles.button} onClick={connectWallet}>
          Connect Wallet
        </button>
      )}
      <button className={styles.button} onClick={sendExample}>
        Send
      </button>
      <button className={styles.button} onClick={mintExample}>
        Mint Token
      </button>
    </div>
  );
};

export default Home;
