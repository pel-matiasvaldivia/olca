import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, ChevronLeft } from 'lucide-react';
import { useQuoteStore } from '../store/quoteStore';
import Step1Personal from '../components/QuoteForm/Step1Personal';
import Step2Products from '../components/QuoteForm/Step2Products';
import Step3Details from '../components/QuoteForm/Step3Details';
import Step4Price from '../components/QuoteForm/Step4Price';
import Step5Confirm from '../components/QuoteForm/Step5Confirm';

const STEPS = [
  { n: 1, label: 'Tus datos' },
  { n: 2, label: 'Vehículos' },
  { n: 3, label: 'Período' },
  { n: 4, label: 'Precio' },
  { n: 5, label: 'Confirmación' },
];

export default function QuoterWizard() {
  const { currentStep, prevStep, submittedQuoteNumero } = useQuoteStore();

  return (
    <div className="min-h-screen bg-dark-50">
      {/* Header */}
      <header className="glass border-b border-dark-200 sticky top-0 z-40">
        <div className="container-max px-4 md:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="text-lg font-black tracking-widest text-brand-600">OLCA RENTAL</Link>
          <span className="text-sm text-dark-500 font-bold uppercase tracking-wider">Cotizador online</span>
        </div>
      </header>

      <div className="container-max px-4 md:px-8 py-8 max-w-4xl mx-auto">

        {/* Step indicator */}
        {!submittedQuoteNumero && (
          <div className="mb-10">
            <div className="flex items-center justify-between relative">
              {/* Progress line */}
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-dark-200 -z-10" />
              <div
                className="absolute top-5 left-0 h-0.5 bg-brand-500 -z-10 transition-all duration-500"
                style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
              />

              {STEPS.map((s) => (
                <div key={s.n} className="flex flex-col items-center gap-2">
                  <div className={
                    s.n < currentStep ? 'step-done' :
                    s.n === currentStep ? 'step-active' :
                    'step-inactive'
                  }>
                    {s.n < currentStep ? <Check className="w-4 h-4" /> : s.n}
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-widest hidden sm:block ${
                    s.n === currentStep ? 'text-brand-600' :
                    s.n < currentStep ? 'text-brand-500' : 'text-dark-400'
                  }`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 1 && <Step1Personal />}
            {currentStep === 2 && <Step2Products />}
            {currentStep === 3 && <Step3Details />}
            {currentStep === 4 && <Step4Price />}
            {currentStep === 5 && <Step5Confirm />}
          </motion.div>
        </AnimatePresence>

        {/* Back button */}
        {currentStep > 1 && !submittedQuoteNumero && (
          <button onClick={prevStep} className="btn-ghost mt-6">
            <ChevronLeft className="w-4 h-4" /> Volver
          </button>
        )}
      </div>
    </div>
  );
}
