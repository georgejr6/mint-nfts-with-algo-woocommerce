jQuery(document).ready(async function() {
    // Retrieve Algorand account information from form fields
    const algodServer = jQuery('#_algod_server').val();
    const algodPort = jQuery('#_algod_port').val();
    const algodToken = jQuery('#_algod_token').val();
    const issuerMnemonic = jQuery('#_issuer_mnemonic').val();

    // Initialize Algod client
    const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

    // Create issuer account
    const issuerAccount = algosdk.mnemonicToSecretKey(issuerMnemonic);

    // Retrieve NFT metadata from form fields
    const tokenName = jQuery('#_token_name').val();
    const tokenSymbol = jQuery('#_token_symbol').val();
    const artworkUrl = jQuery('#_artwork_url').val();
    const creatorAddress = jQuery('#_creator_address').val();
    const commissionRate = jQuery('#_commission_rate').val();

    // Create new asset
    const defaultFrozen = false;
    const total = 1;
    const decimals = 0;
    const assetMetadataHash = algosdk.decodeObj(Buffer.from(JSON.stringify({name: tokenName, symbol: tokenSymbol, image: artworkUrl, creator: creatorAddress, commission: commissionRate})));
    const assetParams = {
        creator: issuerAccount.addr,
        total: total,
        decimals: decimals,
        defaultFrozen: defaultFrozen,
        unitName: tokenSymbol,
        assetName: tokenName,
        assetMetadataHash: assetMetadataHash,
        manager: issuerAccount.addr,
        clawback: issuerAccount.addr,
        freeze: issuerAccount.addr,
    };
    const txnParams = await algodClient.getTransactionParams().do();
    const createAssetTxn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject(assetParams, txnParams);

    // Configure asset to be non-fungible
    createAssetTxn.assetConfigDecimals = decimals;
    createAssetTxn.assetConfigAssetName = null;
    createAssetTxn.assetConfigUnitName = null;
    createAssetTxn.assetConfigURL = null;
    createAssetTxn.assetConfigMetadataHash = assetMetadataHash;

    // Sign and send create asset transaction
    const createAssetTxnSigned = createAssetTxn.signTxn(issuerAccount.sk);
    const createAssetTxnId = await algodClient.sendRawTransaction(createAssetTxnSigned).do();
    console.log(`Asset created with ID: ${createAssetTxnId}`);

    // Opt-in to asset
    const optInTxnParams = await algodClient.getTransactionParams().do();
    const optInTxn = algosdk.makeAssetTransferTxnWithSuggestedParams(
        issuerAccount.addr,
        issuerAccount.addr,
        undefined,
        undefined,
        0,
        undefined,
        createAssetTxnId,
        optInTxnParams
    );
    const optInTxnSigned = optInTxn.signTxn(issuerAccount.sk);
    const optInTxnId = await algodClient.sendRawTransaction(optInTxnSigned).do();
    console.log(`Account opted-in to asset with ID: ${createAssetTxnId}`);

    // Mint NFT
const assetId = createAssetTxnId;
const recipient = issuerAccount.addr;
const revocationTarget = undefined;
const amount = 1;
const note = undefined;
const txn = algosdk.makeAssetTransferTxnWithSuggestedParams(
    issuerAccount.addr,
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
        issuerAccount.addr,
        creatorAddress,
        commissionAmount,
        undefined,
        undefined,
        commissionTxnParams
    );
    const commissionTxnSigned = commissionTxn.signTxn(issuerAccount.sk);
    txn.addAssetTransferTxn(commissionTxnSigned.txID, commissionTxnSigned);
}

// Sign and send asset transfer transaction
const txnSigned = txn.signTxn(issuerAccount.sk);
const txnId = await algodClient.sendRawTransaction(txnSigned).do();
console.log(`NFT minted with ID: ${txnId}`);})
