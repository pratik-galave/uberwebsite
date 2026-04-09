import React from 'react'
import { IoCashOutline, IoCheckmarkCircleOutline } from 'react-icons/io5'

const MakePaymentPanel = ({ customerName, fare, onDone, viewRole = 'captain' }) => {
  const isUserView = viewRole === 'user'

  return (
    <section className="absolute inset-x-0 bottom-0 z-50 rounded-t-3xl bg-white shadow-[0_-12px_30px_rgba(0,0,0,0.24)]">
      <div className="px-4 pb-5 pt-4">
        <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-neutral-300" />

        <p className="text-sm font-medium text-neutral-500">Ride completed</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight text-black">
          {isUserView ? 'Complete payment' : 'Collect payment'}
        </p>

        <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-base text-neutral-600">{isUserView ? 'Captain' : 'Customer'}</p>
            <p className="text-base font-semibold text-black">{customerName}</p>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-neutral-200 pt-3">
            <p className="text-base text-neutral-600">Total fare</p>
            <p className="text-2xl font-bold text-black">{fare}</p>
          </div>
        </div>

        <button
          type="button"
          className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-lg font-semibold text-white transition hover:bg-emerald-700"
        >
          <IoCashOutline className="h-5 w-5" />
          {isUserView ? 'Pay Now' : 'Make Payment'}
        </button>

        <button
          type="button"
          onClick={onDone}
          className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-black text-lg font-semibold text-white transition hover:bg-neutral-800"
        >
          <IoCheckmarkCircleOutline className="h-5 w-5" />
          {isUserView ? 'Done' : 'Finish Ride'}
        </button>
      </div>
    </section>
  )
}

export default MakePaymentPanel