import React from 'react'

const MakePaymentPanel = ({ customerName, fare, isPaymentDone, onMakePayment, onDone }) => {
  return (
    <div className="rounded-t-2xl bg-surface-container-lowest border-t border-outline-variant/20 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] w-full">
      <div className="flex justify-center pt-3 pb-1">
        <div className="h-1 w-10 rounded-full bg-outline-variant/30" />
      </div>

      <div className="px-6 py-4 text-center">
        {isPaymentDone ? (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-container/20 border border-primary-container/30">
              <span className="material-symbols-outlined text-3xl text-primary">check_circle</span>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Complete</p>
            <h2 className="font-display text-xl font-extrabold tracking-tight text-on-surface">Payment Successful</h2>
            <p className="mt-2 text-sm text-on-surface-variant">Thank you for riding with Velocity</p>
          </>
        ) : (
          <>
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Ride Complete</p>
            <h2 className="font-display text-xl font-extrabold tracking-tight text-on-surface">Payment Due</h2>
          </>
        )}
      </div>

      {/* Fare Card */}
      <div className="mx-6 rounded-lg bg-surface-container-low border border-outline-variant/15 p-6 mb-4 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Amount</p>
        <p className="text-4xl font-black font-display tracking-tight text-on-surface">{fare || '—'}</p>
        {customerName && (
          <p className="mt-2 text-sm text-on-surface-variant">
            Passenger: <span className="font-bold text-on-surface">{customerName}</span>
          </p>
        )}
      </div>

      {/* Payment Methods */}
      {!isPaymentDone && (
        <div className="mx-6 rounded-lg border border-outline-variant/15 overflow-hidden mb-4">
          {[
            { icon: 'payments', label: 'Cash Payment', desc: 'Pay directly to captain' },
            { icon: 'account_balance', label: 'UPI / Online', desc: 'Digital payment' },
          ].map((method, i) => (
            <button
              key={method.label}
              type="button"
              className={`w-full flex items-center gap-4 px-4 py-3.5 text-left hover:bg-surface-container-low transition-colors ${i === 0 ? '' : 'border-t border-outline-variant/10'}`}
            >
              <span className="material-symbols-outlined text-xl text-on-surface-variant">{method.icon}</span>
              <div>
                <p className="text-sm font-bold text-on-surface">{method.label}</p>
                <p className="text-xs text-on-surface-variant">{method.desc}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="px-6 pb-6">
        {isPaymentDone ? (
          <button
            type="button"
            onClick={onDone}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-on-surface text-surface py-3.5 text-sm font-bold uppercase tracking-wider hover:bg-on-surface/90 transition-all"
          >
            Done
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onMakePayment}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary-container text-on-primary-container py-3.5 text-sm font-bold uppercase tracking-wider hover:brightness-95 transition-all"
          >
            Confirm Payment
            <span className="material-symbols-outlined text-lg">check</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default MakePaymentPanel