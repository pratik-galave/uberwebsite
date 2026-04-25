import React from 'react'

const MakePaymentPanel = ({ customerName, fare, onMakePayment, onDone, isPaymentDone = false }) => {
  return (
    <section className="absolute inset-x-0 bottom-0 z-50 rounded-t-3xl bg-surface-variant/40 border border-outline/20 shadow-[0_-20px_40px_rgba(0,0,0,0.6)] backdrop-blur-[40px] overflow-hidden">
      {/* Subtle top edge highlight */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      
      {isPaymentDone && (
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#00E676] to-transparent animate-pulse shadow-[0_0_15px_#00E676]"></div>
      )}

      <div className="px-container-margin pb-6 pt-5">
        <div className="mb-stack-md flex items-center justify-center">
          <div className="h-1.5 w-14 rounded-full bg-outline/30" />
        </div>

        <div className="flex flex-col items-center justify-center text-center mb-stack-lg relative">
          {/* Decorative background glow */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150px] h-[150px] rounded-full blur-[40px] pointer-events-none transition-colors duration-500 ${isPaymentDone ? 'bg-[#00E676]/20' : 'bg-primary-container/20'}`}></div>
          
          <div className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-full border mb-3 shadow-[0_0_20px_rgba(0,0,0,0.3)] transition-colors duration-500 ${isPaymentDone ? 'bg-gradient-to-br from-[#00E676]/20 to-surface-variant border-[#00E676]/30 text-[#00E676]' : 'bg-gradient-to-br from-primary-container/20 to-surface-variant border-primary-container/30 text-primary-container'}`}>
            <span className="material-symbols-outlined text-[32px]">{isPaymentDone ? 'check_circle' : 'payments'}</span>
          </div>
          
          <p className="font-label-caps text-[12px] uppercase tracking-widest text-on-surface-variant mb-1">Ride completed</p>
          <p className="font-display-sm text-[24px] font-semibold tracking-tight text-on-surface leading-none">{isPaymentDone ? 'Payment Collected' : 'Collect Payment'}</p>
        </div>

        <div className="rounded-2xl border border-outline/10 bg-surface-container-lowest/40 p-4 relative overflow-hidden mb-stack-lg">
          <div className="flex items-center justify-between border-b border-outline/10 pb-3">
            <p className="font-label-caps text-[12px] uppercase tracking-widest text-on-surface-variant">Customer</p>
            <p className="font-display-xs text-[16px] text-on-surface">{customerName}</p>
          </div>

          <div className="flex items-center justify-between pt-3">
            <p className="font-label-caps text-[12px] uppercase tracking-widest text-on-surface-variant">Total fare</p>
            <p className="font-display-md text-[32px] font-bold text-primary-container leading-none tracking-tighter">{fare}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onMakePayment}
          disabled={isPaymentDone}
          className={`flex h-14 w-full items-center justify-center gap-2 rounded-xl text-background font-label-caps text-[14px] uppercase tracking-widest font-bold shadow-[0_0_20px_rgba(0,0,0,0.3)] transition-all ${isPaymentDone ? 'bg-surface-variant/50 text-on-surface/50 border border-outline/10 shadow-none' : 'bg-gradient-to-r from-primary-container to-[#00B8D4] shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_25px_rgba(0,229,255,0.5)]'}`}
        >
          <span className="material-symbols-outlined text-[20px]">{isPaymentDone ? 'task_alt' : 'account_balance_wallet'}</span>
          {isPaymentDone ? 'Payment Successful' : 'Make Payment'}
        </button>

        <button
          type="button"
          onClick={onDone}
          disabled={!isPaymentDone}
          className={`mt-stack-sm flex h-14 w-full items-center justify-center gap-2 rounded-xl text-background font-label-caps text-[14px] uppercase tracking-widest font-bold shadow-[0_0_20px_rgba(0,0,0,0.3)] transition-all ${!isPaymentDone ? 'bg-surface-variant/50 text-on-surface/50 border border-outline/10 shadow-none' : 'bg-gradient-to-r from-[#00E676] to-[#00C853] shadow-[0_0_20px_rgba(0,230,118,0.3)] hover:shadow-[0_0_25px_rgba(0,230,118,0.5)]'}`}
        >
          <span className="material-symbols-outlined text-[20px]">{isPaymentDone ? 'done_all' : 'lock_clock'}</span>
          {isPaymentDone ? 'Finish Ride' : 'Complete payment first'}
        </button>
      </div>
    </section>
  )
}

export default MakePaymentPanel