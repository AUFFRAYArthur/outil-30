import React, { useState, useEffect, useRef } from 'react';
import SimulatorForm from './components/SimulatorForm';
import ResultsDisplay from './components/ResultsDisplay';
import ChartDisplay from './components/ChartDisplay';

import { Briefcase, Lightbulb, Printer, X } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function App() {
  const [inputs, setInputs] = useState({
    resultatFiscal: 100000,
    cet: 5000,
    tauxIS: 25,
    pourcentageParticipation: 45,
    pourcentageReserves: 45,
    pourcentageDividendes: 10,
    dureeInvestissement: 4,
  });

  const [results, setResults] = useState({
    sansScop: {},
    avecScop: {},
    economies: {},
  });

  const resultsRef = useRef(null);
  const [showNotice, setShowNotice] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleAllocationChange = (
    name: 'pourcentageParticipation' | 'pourcentageReserves' | 'pourcentageDividendes',
    value: number
  ) => {
    setInputs(prev => {
        const minValues = { pourcentageParticipation: 25, pourcentageReserves: 16, pourcentageDividendes: 0 };
        
        const next = { ...prev };
        const originalValue = prev[name];
        
        // Clamp the attempted new value within its absolute possible range
        const otherMins = Object.keys(minValues)
            .filter(k => k !== name)
            .reduce((sum, k) => sum + minValues[k as keyof typeof minValues], 0);
        const clampedValue = Math.max(minValues[name], Math.min(value, 100 - otherMins));
        
        const delta = clampedValue - originalValue;
        next[name] = clampedValue;

        const adjustmentQueue = [
            'pourcentageDividendes',
            'pourcentageReserves',
            'pourcentageParticipation',
        ].filter(k => k !== name) as ('pourcentageParticipation' | 'pourcentageReserves' | 'pourcentageDividendes')[];

        let remainingDelta = -delta;

        for (const key of adjustmentQueue) {
            if (remainingDelta === 0) break;
            const available = next[key] - minValues[key];
            const change = Math.min(Math.abs(remainingDelta), available) * Math.sign(remainingDelta);
            next[key] += change;
            remainingDelta -= change;
        }
        
        // Final check to ensure sum is 100 due to rounding or clamping
        const currentSum = Math.round(next.pourcentageParticipation) + Math.round(next.pourcentageReserves) + Math.round(next.pourcentageDividendes);
        if (currentSum !== 100) {
            next.pourcentageDividendes += (100 - currentSum);
        }

        return next;
    });
  };


  useEffect(() => {
    const { resultatFiscal, cet, tauxIS, pourcentageParticipation, pourcentageReserves } = inputs;
    const tauxISDecimal = tauxIS / 100;

    // Scénario SANS SCOP
    const isSansScop = resultatFiscal * tauxISDecimal;
    const coutFiscalTotalSansScop = isSansScop + cet;
    const resultatNetSansScop = resultatFiscal - isSansScop;

    const sansScop = {
      resultatFiscal,
      baseImposable: resultatFiscal,
      is: isSansScop,
      cet,
      coutFiscalTotal: coutFiscalTotalSansScop,
      resultatNet: resultatNetSansScop,
    };

    // Scénario AVEC SCOP
    // Étape 1: Calcul de la base imposable avec intégration de la CET comme charge
    // Pour les SCOP, on intègre la charge CET théorique dans le calcul fiscal
    const baseImposableAvantDeductions = resultatFiscal + cet; // Intégration CET comme charge d'impôt
    
    // Étape 2: Application des déductions SCOP
    const deductionParticipation = baseImposableAvantDeductions * (pourcentageParticipation / 100);
    const deductionReserves = baseImposableAvantDeductions * Math.min(pourcentageReserves / 100, pourcentageParticipation / 100);
    
    const baseImposableAvecScop = baseImposableAvantDeductions - deductionParticipation - deductionReserves;
    const isAvecScop = baseImposableAvecScop * tauxISDecimal;
    
    // Étape 3: Calcul du résultat net pour la répartition
    const resultatNetAvecScop = resultatFiscal - isAvecScop; // CET = 0 pour les SCOP (exonération)
    
    // Étape 4: Répartition du résultat net (et non du résultat fiscal)
    const montantParticipation = resultatNetAvecScop * (pourcentageParticipation / 100);
    const montantReserves = resultatNetAvecScop * (inputs.pourcentageReserves / 100);
    const montantDividendes = resultatNetAvecScop * (inputs.pourcentageDividendes / 100);

    const coutFiscalTotalAvecScop = isAvecScop; // CET = 0 pour les SCOP

    const avecScop = {
      resultatFiscal,
      baseImposableAvantDeductions,
      montantParticipation,
      montantReserves,
      montantDividendes,
      deductionParticipation,
      deductionReserves,
      baseImposable: baseImposableAvecScop,
      is: isAvecScop,
      cet: 0,
      coutFiscalTotal: coutFiscalTotalAvecScop,
      resultatNet: resultatNetAvecScop,
    };

    // Économies
    const economies = {
      is: isSansScop - isAvecScop,
      cet: cet, // Économie CET due à l'exonération SCOP
      total: (isSansScop - isAvecScop) + cet,
    };

    setResults({ sansScop, avecScop, economies });
  }, [inputs]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center space-x-3">
          <div className="flex items-center space-x-3 flex-1">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Simulateur d'Avantages Fiscaux SCOP</h1>
            <p className="text-sm text-gray-500">Évaluez l'impact du statut SCOP sur la rentabilité de votre entreprise.</p>
          </div>
          </div>
          
          <div className="flex items-center space-x-4 relative">
            {/* Bouton Notice */}
            <div className="relative">
              <button
                onMouseEnter={() => setShowNotice(true)}
                className="flex flex-col items-center space-y-1 p-2 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <Lightbulb className="h-6 w-6 text-yellow-500 group-hover:text-yellow-600" />
                <span className="text-xs text-gray-500">notice</span>
              </button>
              
              {showNotice && (
                <div className="absolute top-full right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
                  <button
                    onClick={() => setShowNotice(false)}
                    className="absolute top-2 left-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <h3 className="font-semibold text-gray-800 mb-2 ml-6">Notice d'utilisation</h3>
                  <div className="text-sm text-gray-600 space-y-2">
                    <p><strong>Objectif :</strong> Ce simulateur compare les avantages fiscaux entre une société classique et une SCOP.</p>
                    <p><strong>Affectation du résultat SCOP :</strong> La répartition (participation, réserves, dividendes) s'applique sur le résultat net après IS, conformément aux règles comptables SCOP.</p>
                    <p><strong>Déductions fiscales :</strong> La participation (min. 25%) et les réserves impartageables (min. 16%) sont déductibles fiscalement, optimisant l'impôt sur les sociétés.</p>
                    <p><strong>Exonération CET :</strong> Les SCOP bénéficient d'une exonération de Contribution Économique Territoriale, générant des économies supplémentaires.</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Bouton Impression */}
            <button
              onClick={handlePrint}
              className="flex flex-col items-center space-y-1 p-2 rounded-lg hover:bg-gray-100 transition-colors group"
            >
              <Printer className="h-6 w-6 text-gray-600 group-hover:text-gray-800" />
              <span className="text-xs text-gray-500">imprimer</span>
            </button>
          </div>
        </div>
        
        {/* Overlay pour fermer la notice en cliquant à l'extérieur */}
        {showNotice && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowNotice(false)}
          />
        )}
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <SimulatorForm 
              inputs={inputs} 
              onInputChange={handleInputChange} 
              onAllocationChange={handleAllocationChange} 
            />
          </div>
          <div className="lg:col-span-3 space-y-8" ref={resultsRef}>
            <ResultsDisplay results={results} />
            <ChartDisplay results={results} />
          </div>
        </div>
      </main>
      
      <footer className="text-center py-6 text-xs text-gray-500">
        <div className="container mx-auto px-4">
          <p>Ce simulateur est un outil pédagogique. Les résultats sont basés sur les données que vous fournissez.</p>
          <p>Consultez toujours un expert-comptable ou un conseiller financier pour une analyse complète.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
