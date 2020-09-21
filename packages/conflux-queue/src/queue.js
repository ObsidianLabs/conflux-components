import notification from '@obsidians/notification'
import { BaseQueueManager } from '@obsidians/queue'

import moment from 'moment'

class Queue extends BaseQueueManager {
  async process (pendingTransaction, txHash, data, callbacks) {
    this.addToQueue({
      txHash,
      status: 'PUSHING',
      ts: moment().unix(),
      data,
    })
    notification.info(`Processing Transaction...`, `Hash: ${txHash}`)

    const tx = await pendingTransaction.mined()
    // notification.info('Transaction Mined', `Block hash: ${tx.blockHash}`)
    this.updateStatus(txHash, 'MINED', { tx }, callbacks)

    const receipt = await pendingTransaction.executed()
    if (receipt.outcomeStatus) {
      notification.error('Transaction Execution Failed', `Outcome status ${receipt.outcomeStatus}`)
      this.updateStatus(txHash, 'FAILED', { receipt }, callbacks)
      return
    } else {
      const gasUsed = receipt.gasUsed.toString()
      const gasFee = receipt.gasFee.toString()
      notification.info('Transaction Executed', `Gas used ${gasUsed}, gas fee ${gasFee}`)
    }
    this.updateStatus(txHash, 'EXECUTED', { receipt }, callbacks)

    await pendingTransaction.confirmed()
    notification.success('Transaction Confirmed', '')
    this.updateStatus(txHash, 'CONFIRMED', { receipt }, callbacks)
  }
}

export default new Queue()