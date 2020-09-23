import notification from '@obsidians/notification'
import { BaseQueueManager } from '@obsidians/queue'

import { abi } from 'js-conflux-sdk'

class Queue extends BaseQueueManager {
  async process (pendingTransaction, txHash, data, callbacks) {
    this.updateStatus(txHash, 'PUSHING', data, callbacks)
    if (data.contractName) {
      notification.info(`Deploying...`, `Deploying contract <b>${data.contractName}</b>...`)
    } else {
      notification.info(`Pushing transaction...`, `Transaction hash <b>${txHash}</b>...`)
    }

    let tx
    try {
      tx = await pendingTransaction.mined()
    } catch (e) {
      this.updateStatus(txHash, 'FAILED-TIMEOUT', { error: { message: e.message } }, callbacks)
      notification.error('Transaction Timeout', e.message)
      return
    }
    this.updateStatus(txHash, 'MINED', { tx }, callbacks)

    const receipt = await pendingTransaction.executed()
    if (receipt.outcomeStatus) {
      pendingTransaction.cfx.call(tx, tx.epochHeight - 1).catch(err => {
        const decoded = abi.errorCoder.decodeError({ data: err.data.replace(/\"/g, '') })
        notification.error('Transaction Failed', decoded.message)

        this.updateStatus(txHash, 'FAILED', { receipt, error: {
          code: err.code,
          message: err.message,
          data: decoded.message,
        } }, callbacks)
      })

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