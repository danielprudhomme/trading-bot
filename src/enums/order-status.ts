export enum OrderStatus {
  Waiting = 'waiting',
  Open = 'open', // we can have 2 open orders at a time (i.e SL and TP)
  Closed = 'closed',
  Canceled = 'canceled'
}