import redux from '@obsidians/redux'
import notification from '@obsidians/notification'

import moment from 'moment'

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

class Queue {
  constructor () {
    this.button = null
    this.pending = []
    this.txs = []
  }

  addToQueue (item) {
    this.pending.unshift(item)
    this.button.forceUpdate()
  }

  updateStatus (id, status, extraData) {
    const index = this.pending.findIndex(item => item.id === id)
    if (index === -1) {
      return
    }

    if (status && status !== 'FAILED') {
      this.pending[index].status = status
      this.pending[index].ts = moment().unix()
      this.pending[index].data = { ...this.pending[index].data, ...extraData }
      this.button.forceUpdate()

      if (status === 'EXECUTED' && this.pending[index].modalWhenExecuted) {
        this.button.openTransaction(this.pending[index])
      }

      return this.pending[index].data
    } else {
      const confirmed = this.pending.splice(index, 1)[0]
      confirmed.status = status
      confirmed.ts = moment().unix()
      confirmed.data = { ...confirmed.data, ...extraData }

      const { network } = redux.getState()
      redux.dispatch('ADD_TRANSACTION', { network, tx: confirmed })
      this.button.forceUpdate()
      return confirmed.data
    }
  }

  async process (pendingTransaction, data, callbacks) {
    this.addToQueue({
      id: data.txHash,
      status: 'PUSHING',
      ts: moment().unix(),
      modalWhenExecuted: data.modalWhenExecuted,
      data,
    })

    let updatedData

    const tx = await pendingTransaction.mined()
    // notification.info('Transaction Mined', `Block hash: ${tx.blockHash}`)
    updatedData = this.updateStatus(data.txHash, 'MINED', { tx })
    callbacks.mined && callbacks.mined(updatedData)

    const receipt = await pendingTransaction.executed()
    if (receipt.outcomeStatus) {
      notification.error('Transaction Execution Failed', `Outcome status ${receipt.outcomeStatus}`)
      updatedData = this.updateStatus(data.txHash, 'FAILED', { receipt })
      callbacks.failed && callbacks.failed(new Error(`Execution failed. Outcome status ${receipt.outcomeStatus}`))
      return
    } else {
      const gasUsed = receipt.gasUsed.toString()
      const gasFee = receipt.gasFee.toString()
      notification.info('Transaction Executed', `Gas used ${gasUsed}, gas fee ${gasFee}`)
    }
    updatedData = this.updateStatus(data.txHash, 'EXECUTED', { receipt })
    callbacks.executed && callbacks.executed(updatedData)

    await pendingTransaction.confirmed()
    notification.success('Transaction Confirmed', '')
    updatedData = this.updateStatus(data.txHash, '', { receipt })
    callbacks.confirmed && callbacks.confirmed(updatedData)
  }

  async add (sender, data, callbacks = {}) {
    const pendingTransaction = sender()

    const txHash = await pendingTransaction
    notification.info(`Processing Transaction...`, `Hash: ${txHash}`)
    data.txHash = txHash
    
    this.process(pendingTransaction, data, callbacks)
  }
}

export default new Queue()