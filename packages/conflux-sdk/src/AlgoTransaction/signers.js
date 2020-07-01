export const regularSigner = sp => async (txn, gid) => {
  // let algoTxn = new txnBuilder.Transaction(txn)
  // if (gid) {
  //   algoTxn.group = gid
  // }
  // return {
  //   txID: algoTxn.txID().toString(),
  //   blob: await sp({ algoTxn })
  // }
}

export const msigSigner = (getSigs, msig) => async (txn, gid) => {
  // let algoTxn = new multisig.MultisigTransaction(txn)
  // if (gid) {
  //   algoTxn.group = gid
  // }

  // const sigs = await getSigs(algoTxn)

  // const subsig = msig.addrs.map(addr => {
  //   const pk = address.decode(addr).publicKey
  //   if (!sigs[addr]) {
  //     return { pk: Buffer.from(pk) }
  //   }
  //   return {
  //     pk: Buffer.from(pk),
  //     s: sigs[addr]
  //   }
  // })

  // const abbrMsig = {
  //   v: msig.version,
  //   thr: msig.threshold,
  //   subsig,
  // }

  // return {
  //   txID: algoTxn.txID().toString(),
  //   blob: new Uint8Array(encoding.encode({
  //     msig: abbrMsig,
  //     txn: algoTxn.get_obj_for_encoding(),
  //   }))
  // }
}

export const lsigSigner = (sp, lsig) => async (txn, gid) => {
  // const byteCode = new Uint8Array(Buffer.from(lsig.program, 'base64'))
  // let logicSig
  // if (lsig.args) {
  //   logicSig = algosdk.makeLogicSig(byteCode, lsig.args)
  // } else {
  //   logicSig = algosdk.makeLogicSig(byteCode)
  // }
  // if (sp) {
  //   await sp({ logicSig })
  // }
  // return algosdk.signLogicSigTransaction(txn, logicSig)
}