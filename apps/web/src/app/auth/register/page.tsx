import { SignUp } from '@clerk/nextjs';

export default function RegisterPage() {
  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <SignUp
        appearance={{
          elements: {
            rootBox: 'w-full max-w-md',
            card: 'rounded-2xl border border-white/10 bg-slate-900/90 backdrop-blur-sm shadow-2xl',
            headerTitle: 'text-white text-2xl font-bold',
            headerSubtitle: 'text-slate-400',
            socialButtonsBlockButton: 'bg-white/10 border border-white/20 text-white hover:bg-white/20',
            socialButtonsBlockButtonText: 'text-white font-medium',
            dividerLine: 'bg-white/20',
            dividerText: 'text-slate-400',
            formFieldLabel: 'text-slate-300 text-sm font-medium',
            formFieldInput:
              'bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-lg focus:border-blue-500 focus:ring-blue-500',
            formButtonPrimary:
              'bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/25',
            footerActionLink: 'text-blue-400 hover:text-blue-300',
            formFieldSuccessText: 'text-green-400',
            formFieldErrorText: 'text-red-400',
            alertText: 'text-slate-300',
            logoBox: 'hidden',
          },
          layout: {
            socialButtonsPlacement: 'top',
          },
        }}
      />
    </div>
  );
}
