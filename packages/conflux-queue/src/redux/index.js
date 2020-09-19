import Immutable, { List, Map } from 'immutable'

export default {
  default: Immutable.fromJS({
    dev: {},
  }),
  persist: true,
  actions: {
    ADD_TRANSACTION: {
      reducer: (state, { payload }) => state.updateIn([payload.network, 'txs'], (txs = List()) => {
        return txs.push(Immutable.fromJS(payload.tx))
      })
    },
  }
}