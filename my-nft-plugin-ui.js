jQuery(document).ready(function() {
  const nftMintingForm = jQuery('#my-nft-minting-form');

  // Set up form submission handler
  nftMintingForm.submit(async function(event) {
    event.preventDefault();

    // Retrieve NFT metadata from form fields
    const tokenName = jQuery('#_token_name').val();
    const tokenSymbol = jQuery('#_token_symbol').val();
    const artworkUrl = jQuery('#_artwork_url').val();
    const creatorAddress = jQuery('#_creator_address').val();
    const commissionRate = jQuery('#_commission_rate').val();

    // Mint NFT
    const assetId = jQuery('#_asset_id').val();
    const recipient = jQuery('#_recipient_address').val();
    const revocationTarget = undefined;
    const amount = 1;
    const note = undefined;
    const txn = algosdk.makeAssetTransferTxnWithSuggestedParams(
      issuerAddress,
      recipient,
      revocationTarget,
      amount,
      note,
      assetId,
      txnParams
    );

    // Add commission to transaction
    const commissionAmount = Math.floor(txn.amount * commissionRate);
    if (commissionAmount > 0) {
      const commissionTxnParams = await algodClient.getTransactionParams().do();
      const commissionTxn = algosdk.makePaymentTxnWithSuggestedParams(
        issuerAddress,
        creatorAddress,
        commissionAmount,
        undefined,
        undefined,
        commissionTxnParams
      );
      const commissionTxnSigned = commissionTxn.signTxn(issuerSk);
      txn.addAssetTransferTxn(commissionTxnSigned.txID, commissionTxnSigned);
    }

    // Sign and send asset transfer transaction
    const txnSigned = txn.signTxn(issuerSk);
    const txnId = await algodClient.sendRawTransaction(txnSigned).do();
    console.log(`NFT minted with ID: ${txnId}`);
  });
});
