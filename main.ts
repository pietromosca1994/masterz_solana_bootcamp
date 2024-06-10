import web3 from "@solana/web3.js";
import {createMint, mintTo, getOrCreateAssociatedTokenAccount, transfer} from "@solana/spl-token";

// create wallets 
let payer = web3.Keypair.generate();
let receiver = web3.Keypair.generate();

// create connection
let connection = new web3.Connection(web3.clusterApiUrl("devnet"), "confirmed");

async function main() {
  // request airdrop
  try{
    const airdropSignature = await connection.requestAirdrop(
      payer.publicKey,
      1 * web3.LAMPORTS_PER_SOL
    );
  
    console.log(`Success! Check out your TX here: https://explorer.solana.com/tx/${airdropSignature}?cluster=devnet`);
  } catch (error) {
      console.error(error);
  }

  // create mint
  let mint=await createMint(
      connection,
      payer,
      payer.publicKey,
      null,
      6
  )
  console.log("Mint address: ", mint.toBase58());

  // create token account for payer
  let payerTokenAccount=await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint,
      payer.publicKey
  )
  console.log("Associated Token Account for payer: ", payerTokenAccount.address.toBase58())

  // create token account for receiver
  let receiverTokenAccount=await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    receiver.publicKey,
  )
  console.log("Associated Token Account for receiver: ", receiverTokenAccount.address.toBase58())

  // mint tokens
  const amount=10e6;
  await mintTo(
      connection,
      payer,
      mint,
      payerTokenAccount.address,
      payer.publicKey,
      amount,
  )
  console.log("Minted ", amount, " tokens to ", payerTokenAccount.address.toBase58())

  // transfer token 
  const transferAmount=1e5;
  await transfer(
      connection,
      payer,    
      payerTokenAccount.address,
      receiverTokenAccount.address,
      payer.publicKey,
      transferAmount
  ),
  console.log(`Transferred ${transferAmount} from ${payerTokenAccount.address.toBase58()} to ${receiverTokenAccount.address.toBase58()}`)

}

main();