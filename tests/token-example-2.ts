import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TokenExample2 } from "../target/types/token_example_2";
import { assert } from "chai";
import { PublicKey, Keypair, Connection } from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  getAccount,
  getMint,
  getTransferFeeConfig,
  getTransferFeeAmount,
} from "@solana/spl-token";

// Configure the client to use the local cluster.
anchor.setProvider(anchor.AnchorProvider.env());
const program = anchor.workspace.tokenExample2 as Program<TokenExample2>;
const provider = anchor.getProvider() as anchor.AnchorProvider;
const connection = provider.connection as unknown as Connection;

describe("token-example-2", () => {
  const creator = Keypair.generate();
  const mintKeypair = Keypair.generate();
  const recipient = Keypair.generate();
  const recipient2 = Keypair.generate();

  before(async () => {
    Promise.all([
      airdrop(connection, creator.publicKey),
      airdrop(connection, recipient.publicKey),
    ]);
  });

  it("should initialize a mint with transfer fee extension", async () => {
    const feeBps = 500;
    const maxFee = 1000000;

    const txInitSplToken = await program.methods
      .initialize(feeBps, new anchor.BN(maxFee))
      .accounts({
        creator: creator.publicKey,
        mint: mintKeypair.publicKey,
      })
      .signers([creator, mintKeypair])
      .rpc({ skipPreflight: true }); // ?

    const mintInfo = await getMintInfo(mintKeypair.publicKey);

    console.log("tx spl token: ", txInitSplToken);
    console.log("mintInfo: ", mintInfo);

    assert.equal(
      mintInfo.mintAuthority?.toBase58(),
      creator.publicKey.toBase58(),
    );
    assert.equal(mintInfo.decimals, 9);
    assert.equal(mintInfo.supply, BigInt(0));

    const transferFeeConfig = getTransferFeeConfig(mintInfo);
    assert.isNotNull(transferFeeConfig);
    assert.equal(
      transferFeeConfig?.newerTransferFee.transferFeeBasisPoints,
      feeBps
    );
    assert.equal(
      transferFeeConfig?.newerTransferFee.maximumFee,
      BigInt(maxFee)
    );
  });
});

export async function airdrop(
  connection: any,
  address: any,
  amount = 500_000_000_000
) {
  await connection.confirmTransaction(
    await connection.requestAirdrop(address, amount),
    "confirmed"
  );
}

function getMintInfo(mint: PublicKey) {
  return getMint(connection, mint, "confirmed", TOKEN_2022_PROGRAM_ID);
}