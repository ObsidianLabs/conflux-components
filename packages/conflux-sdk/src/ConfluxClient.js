import { Conflux, util } from 'js-conflux-sdk'

export default class ConfluxClient {
  constructor(nodeUrl) {
    this.cfx = new Conflux({
      url: nodeUrl,
      defaultGasPrice: 100, // The default gas price of your following transactions
      defaultGas: 1000000, // The default gas of your following transactions
      logger: console,
    })
  }
  
  // async getDefaultParams () {
  //   const params = await this.algod.getTransactionParams()
  //   return {
  //     genesisHash: params.genesishashb64,
  //     genesisID: params.genesisID,
  //     firstRound: params.lastRound,
  //     lastRound: params.lastRound + 1000,
  //     fee: params.minFee
  //   }
  // }

  async getTransactions (addr, cursor) {
    // return await this.algod.transactionByAddress(addr, cursor)
  }

  async transfer () {
    const tx = {
      from,
      to,
      value: util.unit.fromCFXToDrip(0.125)
    }
    const txHash = await this.cfx.sendTransaction(tx)
    console.log(txHash)
    return txHash
  }

  async pushTransaction (signedTxn) {
    let result
    try {
      result = await this.algod.sendRawTransactions(signedTxn)
    } catch (e) {
      throw new Error(e.text)
    }
    await this.waitForConfirmation(result.txId)
    return result
  }

  // async waitForConfirmation (txId) {
  //   while (true) {
  //     let lastround = (await this.algod.status()).lastRound;
  //     let pendingInfo = await this.algod.pendingTransactionInformation(txId);
  //     if (pendingInfo.round && pendingInfo.round > 0) {
  //       console.log("Transaction " + pendingInfo.tx + " confirmed in round " + pendingInfo.round);
  //       break;
  //     }
  //     await this.algod.statusAfterBlock(lastround + 1);
  //   }
  // }
}