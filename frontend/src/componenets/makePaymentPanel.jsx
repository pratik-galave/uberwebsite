import React from 'react'
import { IoCashOutline, IoCheckmarkCircleOutline } from 'react-icons/io5'

const MakePaymentPanel = ({ customerName, fare, onMakePayment, onDone, isPaymentDone = false }) => {
  return (
    <section className="absolute inset-x-0 bottom-0 z-50 rounded-t-3xl bg-white shadow-[0_-12px_30px_rgba(0,0,0,0.24)]">
      <div className="px-4 pb-5 pt-4">
        <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-neutral-300" />

        <p className="text-sm font-medium text-neutral-500">Ride completed</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight text-black">Collect payment</p>

        <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-base text-neutral-600">Customer</p>
            <p className="text-base font-semibold text-black">{customerName}</p>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-neutral-200 pt-3">
            <p className="text-base text-neutral-600">Total fare</p>
            <p className="text-2xl font-bold text-black">{fare}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onMakePayment}
          disabled={isPaymentDone}
          className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-lg font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
        >
          <IoCashOutline className="h-5 w-5" />
          {isPaymentDone ? 'Payment Successful' : 'Make Payment'}
        </button>

        <button
          type="button"
          onClick={onDone}
          disabled={!isPaymentDone}
          className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-black text-lg font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-500"
        >
          <IoCheckmarkCircleOutline className="h-5 w-5" />
          {isPaymentDone ? 'Finish Ride' : 'Complete payment first'}
        </button>
      </div>
    </section>
  )
}

export default MakePaymentPanel