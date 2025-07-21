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
    plafondTauxReduit: 42500,
    tauxISReduit: 15,
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
    const { resultatFiscal, cet, tauxIS, plafondTauxReduit, tauxISReduit, pourcentageParticipation, pourcentageReserves } = inputs;
    const tauxISDecimal = tauxIS / 100;
    const tauxISReduitDecimal = tauxISReduit / 100;

    // Fonction de calcul de l'IS avec taux progressif
    const calculerIS = (baseImposable: number) => {
      if (baseImposable <= 0) return 0;
      
      let isTotal = 0;
      
      // Application du taux réduit si applicable
      if (plafondTauxReduit > 0 && tauxISReduit > 0) {
        const montantTauxReduit = Math.min(baseImposable, plafondTauxReduit);
        isTotal += montantTauxReduit * tauxISReduitDecimal;
        
        // Application du taux normal sur le surplus
        if (baseImposable > plafondTauxReduit) {
          const montantTauxNormal = baseImposable - plafondTauxReduit;
          isTotal += montantTauxNormal * tauxISDecimal;
        }
      } else {
        // Pas de taux réduit applicable, taux normal sur la totalité
        isTotal = baseImposable * tauxISDecimal;
      }
      
      return isTotal;
    };

    // Scénario SANS SCOP
    const isSansScop = calculerIS(resultatFiscal);
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

    // Scénario AVEC SCOP - Algorithme itératif
    // Calcul SCOP selon la formule: Participation = Résultat Net Après IS × Taux Participation
    const tauxParticipation = pourcentageParticipation / 100;
    const tauxReserves = pourcentageReserves / 100;
    const tauxDividendes = inputs.pourcentageDividendes / 100;
    
    // Base imposable initiale
    const baseImposableAvantDeductions = resultatFiscal + cet;
    
    // Calcul itératif pour convergence
    let deductionParticipation = 0;
    let deductionReserves = 0;
    let baseImposableApresDeductions = 0;
    let isAvecScop = 0;
    let resultatNetAvecScop = 0;
    let montantParticipation = 0;
    
    // Itération pour convergence (max 10 itérations)
    for (let i = 0; i < 10; i++) {
      // Calcul de l'IS avec déductions actuelles
      baseImposableApresDeductions = baseImposableAvantDeductions - deductionParticipation - deductionReserves;
      isAvecScop = Math.max(0, calculerIS(baseImposableApresDeductions));
      
      // Résultat net après IS
      resultatNetAvecScop = baseImposableAvantDeductions - isAvecScop;
      
      // Calcul de la nouvelle déduction participation basée sur le résultat net
      const nouvelleDeductionParticipation = resultatNetAvecScop * tauxParticipation;
      
      // Calcul de la déduction réserves : montant réserves limité au montant participation
      const montantReserves = resultatNetAvecScop * tauxReserves;
      deductionReserves = Math.min(montantReserves, nouvelleDeductionParticipation);
      
      // Test de convergence
      if (Math.abs(nouvelleDeductionParticipation - deductionParticipation) < 0.01) {
        deductionParticipation = nouvelleDeductionParticipation;
        break;
      }
      
      // Mise à jour pour la prochaine itération
      deductionParticipation = nouvelleDeductionParticipation;
    }
    
    // Recalcul final du résultat net après IS avec l'IS convergé
    resultatNetAvecScop = baseImposableAvantDeductions - isAvecScop;
    
    // Calcul final de la participation sur le résultat net après IS (identique à la déduction)
    montantParticipation = resultatNetAvecScop * tauxParticipation;
    
    // La déduction participation doit être strictement égale au montant participation
    deductionParticipation = montantParticipation;
    
    // Répartition finale du résultat net
    const montantReservesFinal = resultatNetAvecScop * tauxReserves;
    const montantDividendesFinal = resultatNetAvecScop * tauxDividendes;
    
    // Recalcul final de la déduction réserves avec le montant final de participation
    deductionReserves = Math.min(montantReservesFinal, montantParticipation);
    
    // Recalcul final de la base imposable à l'IS avec les déductions finales
    baseImposableApresDeductions = baseImposableAvantDeductions - deductionParticipation - deductionReserves;
    
    // Recalcul final de l'IS avec la base imposable corrigée
    isAvecScop = Math.max(0, calculerIS(baseImposableApresDeductions));
    
    const coutFiscalTotalAvecScop = isAvecScop; // CET = 0 pour les SCOP

    const avecScop = {
      resultatFiscal,
      baseImposableAvantDeductions: baseImposableAvantDeductions,
      montantParticipation: montantParticipation,
      montantReserves: montantReservesFinal,
      montantDividendes: montantDividendesFinal,
      deductionParticipation,
      deductionReserves,
      baseImposable: baseImposableApresDeductions,
      is: isAvecScop,
      cet: 0,
      coutFiscalTotal: coutFiscalTotalAvecScop,
      resultatNet: baseImposableAvantDeductions - isAvecScop,
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
    // Configuration optimisée pour l'impression PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Simulateur SCOP - Résultats A3</title>
            <style>
              @page {
                size: A3 portrait;
                margin: 0.4in;
              }
              body {
                font-family: system-ui, -apple-system, sans-serif;
                margin: 0;
                padding: 0;
                transform: scale(0.9);
                transform-origin: top left;
                width: 111%;
              }
            </style>
            <link href="/src/index.css" rel="stylesheet">
          </head>
          <body>
            ${document.querySelector('main')?.outerHTML || ''}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    } else {
      // Fallback vers l'impression standard
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center space-x-3">
          <div className="flex items-center space-x-3 flex-1">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Simulateur d'Avantages Fiscaux SCOP</h1>
            <p className="text-lg text-gray-500">Évaluez l'impact du statut SCOP sur la rentabilité de votre entreprise.</p>
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
                <span className="text-sm text-gray-500">notice</span>
              </button>
              
              {showNotice && (
                <div className="absolute top-full right-0 mt-2 w-[32rem] bg-white border border-gray-200 rounded-lg shadow-lg p-6 z-50">
                  <button
                    onClick={() => setShowNotice(false)}
                    className="absolute top-2 left-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <h3 className="font-semibold text-gray-800 mb-4 ml-6 text-xl">Notice d'utilisation</h3>
                  <div className="text-lg text-gray-600 space-y-4">
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
              <span className="text-sm text-gray-500">imprimer</span>
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
          <div className="lg:col-span-3" ref={resultsRef}>
            <ResultsDisplay results={results} />
          </div>
        </div>
      </main>
      
      <footer className="text-center py-6 text-xs text-gray-500">
        <div className="container mx-auto px-4">
          <p className="text-base">Ce simulateur est un outil pédagogique. Les résultats sont basés sur les données que vous fournissez.</p>
          <p className="text-base">Consultez toujours un expert-comptable ou un conseiller financier pour une analyse complète.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
