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
    this.pending.push(item)
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
    } else {
      const deleted = this.pending.splice(index, 1)[0]
      deleted.status = status
      deleted.ts = moment().unix()
      deleted.data = { ...deleted.data, ...extraData }

      const { network } = redux.getState()
      redux.dispatch('ADD_TRANSACTION', { network, tx: deleted })
    }
    this.button.forceUpdate()
  }

  async process (pendingTransaction, data) {
    this.addToQueue({
      id: data.txHash,
      status: 'PUSHING',
      ts: moment().unix(),
      data,
    })

    try {
      await delay(5000)

      const tx = await pendingTransaction.mined()
      notification.info('Transaction Mined', `Block hash: ${tx.blockHash}`)
      this.updateStatus(data.txHash, 'MINED', { tx })

      await delay(5000)

      const receipt = await pendingTransaction.executed()
      if (receipt.outcomeStatus) {
        notification.error('Transaction Execution Failed', `Outcome status ${receipt.outcomeStatus}`)
        this.updateStatus(data.txHash, 'FAILED', { receipt })
        return
      } else {
        const gasUsed = receipt.gasUsed.toString()
        const gasFee = receipt.gasFee.toString()
        notification.info('Transaction Executed', `Gas used ${gasUsed}, gas fee ${gasFee}`)
      }
      this.updateStatus(data.txHash, 'EXECUTED', { receipt })

      await delay(5000)

      await pendingTransaction.confirmed()
      notification.success('Transaction Confirmed', '')
      this.updateStatus(data.txHash, '', { receipt })
    } catch (e) {
      console.warn(e)
      notification.error('Error', e.message)
      throw e
    }
  }

  async add (sender, data) {
    const pendingTransaction = sender()
    try {
      const txHash = await pendingTransaction
      notification.info(`Processing Transaction...`, `Hash: ${txHash}`)
      data.txHash = txHash
    } catch (e) {
      console.warn(e)
      notification.error('Error', e.message)
      throw e
    }
    
    this.process(pendingTransaction, data)
  }
}

export default new Queue()