import React, { useState, useEffect, useRef } from 'react';
import SimulatorForm from './components/SimulatorForm';
import ResultsDisplay from './components/ResultsDisplay';
import ChartDisplay from './components/ChartDisplay';
import { Briefcase } from 'lucide-react';
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
    const resultatNetSansScop = resultatFiscal - coutFiscalTotalSansScop;

    const sansScop = {
      resultatFiscal,
      baseImposable: resultatFiscal,
      is: isSansScop,
      cet,
      coutFiscalTotal: coutFiscalTotalSansScop,
      resultatNet: resultatNetSansScop,
    };

    // Scénario AVEC SCOP
    const montantParticipation = resultatFiscal * (pourcentageParticipation / 100);
    const montantReserves = resultatFiscal * (inputs.pourcentageReserves / 100);
    const montantDividendes = resultatFiscal * (inputs.pourcentageDividendes / 100);

    const deductionParticipation = montantParticipation;
    const deductionReserves = resultatFiscal * Math.min(pourcentageReserves / 100, pourcentageParticipation / 100);

    const baseImposableAvecScop = resultatFiscal - deductionParticipation - deductionReserves;
    const isAvecScop = baseImposableAvecScop * tauxISDecimal;
    const coutFiscalTotalAvecScop = isAvecScop; // CET = 0
    const resultatNetAvecScop = resultatFiscal - coutFiscalTotalAvecScop;

    const avecScop = {
      resultatFiscal,
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
      cet: cet,
      total: (isSansScop - isAvecScop) + cet,
    };

    setResults({ sansScop, avecScop, economies });
  }, [inputs]);

  const exportPDF = () => {
    const input = resultsRef.current;
    if (input) {
      html2canvas(input, { scale: 2 }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        const width = pdfWidth - 20;
        const height = width / ratio;
        
        let finalHeight = height;
        if (height > pdfHeight - 20) {
            finalHeight = pdfHeight - 20;
        }

        pdf.text("Rapport de Simulation - Avantages Fiscaux SCOP", 10, 10);
        pdf.addImage(imgData, 'PNG', 10, 20, width, finalHeight);
        pdf.save(`simulation-scop-${new Date().toISOString().slice(0,10)}.pdf`);
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center space-x-3">
          <Briefcase className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Simulateur d'Avantages Fiscaux SCOP</h1>
            <p className="text-sm text-gray-500">Évaluez l'impact du statut SCOP sur la rentabilité de votre entreprise.</p>
          </div>
        </div>
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
            <ResultsDisplay results={results} onExportPDF={exportPDF} />
            {inputs.dureeInvestissement > 0 && (
              <ChartDisplay results={results} duree={inputs.dureeInvestissement} />
            )}
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
