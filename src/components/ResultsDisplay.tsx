import React from 'react';
import Card from './Card';
import { TrendingUp, BarChart3 } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartJSTooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import Tooltip from './Tooltip';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartJSTooltip,
  Legend
);

interface ResultsDisplayProps {
  results: any;
}

const formatCurrency = (value: number) => {
  if (isNaN(value)) return 'N/A';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
};

// Composant spécial pour les lignes IS avec tooltip
const ISResultRow: React.FC<{ label: string, sansScopValue: number, avecScopValue: number, sansScopDetail: string, avecScopDetail: string, indent?: boolean }> = 
({ label, sansScopValue, avecScopValue, sansScopDetail, avecScopDetail, indent = false }) => {
  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 cursor-help relative group">
      <td className={`py-4 px-6 text-lg text-gray-600 flex items-center space-x-2 ${indent ? 'pl-12' : ''}`}>
        <span>{label}</span>
        <Tooltip text={sansScopDetail} />
      </td>
      <td className="py-4 px-6 text-lg font-medium text-right text-red-600" title={sansScopDetail}>
        {formatCurrency(sansScopValue)}
      </td>
      <td className="py-4 px-6 text-lg font-medium text-right text-red-600" title={avecScopDetail}>
        {formatCurrency(avecScopValue)}
      </td>
    </tr>
  );
};

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  const { sansScop, avecScop, economies } = results;

  // Fonction pour calculer le détail de l'IS avec taux progressif
  const getISDetail = (baseImposable: number, plafondTauxReduit: number, tauxISReduit: number, tauxISNormal: number) => {
    if (baseImposable <= 0) return "Aucun IS à payer";
    
    let detail = "Calcul détaillé de l'IS :\n";
    
    if (plafondTauxReduit > 0 && tauxISReduit > 0) {
      const montantTauxReduit = Math.min(baseImposable, plafondTauxReduit);
      const isTauxReduit = montantTauxReduit * (tauxISReduit / 100);
      
      detail += `• Montant soumis au taux réduit : ${formatCurrency(montantTauxReduit)} × ${tauxISReduit}% = ${formatCurrency(isTauxReduit)}\n`;
      
      if (baseImposable > plafondTauxReduit) {
        const montantTauxNormal = baseImposable - plafondTauxReduit;
        const isTauxNormal = montantTauxNormal * (tauxISNormal / 100);
        detail += `• Montant soumis au taux normal : ${formatCurrency(montantTauxNormal)} × ${tauxISNormal}% = ${formatCurrency(isTauxNormal)}\n`;
      }
      
      detail += `• Total IS = ${formatCurrency(baseImposable <= plafondTauxReduit ? isTauxReduit : isTauxReduit + (baseImposable - plafondTauxReduit) * (tauxISNormal / 100))}`;
    } else {
      const isTotal = baseImposable * (tauxISNormal / 100);
      detail += `• Aucun taux réduit applicable\n`;
      detail += `• Montant total soumis au taux normal : ${formatCurrency(baseImposable)} × ${tauxISNormal}% = ${formatCurrency(isTotal)}\n`;
      detail += `• Total IS = ${formatCurrency(isTotal)}`;
    }
    
    return detail;
  };

  // Données pour le graphique
  const chartData = {
    labels: ['IS', 'CET', 'Coût Fiscal Total', 'Résultat Net'],
    datasets: [
      {
        label: 'Sans SCOP',
        data: [
          sansScop.is || 0,
          sansScop.cet || 0,
          sansScop.coutFiscalTotal || 0,
          sansScop.resultatNet || 0,
        ],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
      },
      {
        label: 'Avec SCOP',
        data: [
          avecScop.is || 0,
          avecScop.cet || 0,
          avecScop.coutFiscalTotal || 0,
          avecScop.resultatNet || 0,
        ],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return formatCurrency(value);
          }
        }
      }
    },
  };

  const ResultRow: React.FC<{ label: string, sansScopValue: number | string, avecScopValue: number | string, isCurrency?: boolean, isBold?: boolean, isSubtle?: boolean, isPositive?: boolean, isNegative?: boolean, indent?: boolean }> = 
  ({ label, sansScopValue, avecScopValue, isCurrency = true, isBold = false, isSubtle = false, isPositive = false, isNegative = false, indent = false }) => {
    
    const formatValue = (value: number | string) => {
        if (typeof value === 'string') return value;
        return isCurrency ? formatCurrency(value) : value;
    };

    let valueClass = "text-gray-800";
    if (isPositive) valueClass = "text-green-600";
    if (isNegative) valueClass = "text-red-600";

    return (
        <tr className={`border-b border-gray-200 last:border-b-0 ${isBold ? 'bg-gray-50 font-semibold' : ''}`}>
            <td className={`py-4 px-6 text-lg ${isBold ? 'text-gray-800' : 'text-gray-600'} ${indent ? 'pl-12' : ''}`}>{label}</td>
            <td className={`py-4 px-6 text-lg font-medium text-right ${isSubtle ? 'text-gray-400' : 'text-gray-800'}`}>{formatValue(sansScopValue)}</td>
            <td className={`py-4 px-6 text-lg font-medium text-right ${isSubtle ? 'text-gray-400' : valueClass}`}>{formatValue(avecScopValue)}</td>
        </tr>
    );
  };

  return (
    <Card className="flex flex-col h-full">
      <div className="mb-6">
        <h2 className="text-4xl font-bold text-gray-800 mb-2">Résultats Comparatifs</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-green-50 border border-green-200 p-6 rounded-lg text-center">
          <p className="text-lg text-green-700">Économie d'IS</p>
          <p className="text-3xl font-bold text-green-800 flex items-center justify-center space-x-1">
            <TrendingUp size={20} />
            <span>{formatCurrency(economies.is)}</span>
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 p-6 rounded-lg text-center">
          <p className="text-lg text-green-700">Économie de CET</p>
          <p className="text-3xl font-bold text-green-800 flex items-center justify-center space-x-1">
            <TrendingUp size={20} />
            <span>{formatCurrency(economies.cet)}</span>
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg text-center">
          <p className="text-lg text-blue-700">Gain Fiscal Total Annuel</p>
          <p className="text-3xl font-bold text-blue-800 flex items-center justify-center space-x-1">
            <TrendingUp size={20} />
            <span>{formatCurrency(economies.total)}</span>
          </p>
        </div>
      </div>

      <div className="overflow-x-auto mb-10">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-5 px-6 text-left text-base font-semibold text-gray-500 uppercase tracking-wider">Indicateur</th>
              <th className="py-5 px-6 text-right text-base font-semibold text-gray-500 uppercase tracking-wider">Sans SCOP</th>
              <th className="py-5 px-6 text-right text-base font-semibold text-gray-500 uppercase tracking-wider">Avec SCOP</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            <ResultRow label="Résultat fiscal avant affectation" sansScopValue={sansScop.resultatFiscal} avecScopValue={avecScop.resultatFiscal} isBold />
            
            <ISResultRow 
              label="Impôt sur les Sociétés (IS)" 
              sansScopValue={sansScop.is} 
              avecScopValue={avecScop.is}
              sansScopDetail={getISDetail(sansScop.baseImposable, 42500, 15, 25)}
              avecScopDetail={getISDetail(avecScop.baseImposable, 42500, 15, 25)}
            />
            
            <ResultRow label="Contribution Économique (CET)" sansScopValue={sansScop.cet} avecScopValue={avecScop.cet} isNegative />
            
            <tr className="bg-gray-50"><td colSpan={3} className="py-2 px-5 text-sm font-semibold text-gray-500">TRAITEMENT FISCAL SCOP</td></tr>
            <ResultRow label="Base imposable avant déductions" sansScopValue={sansScop.baseImposable} avecScopValue={avecScop.baseImposableAvantDeductions} indent />
            
            <tr className="bg-gray-50"><td colSpan={3} className="py-3 px-6 text-base font-semibold text-gray-500">AFFECTATION DU RÉSULTAT (SCOP)</td></tr>
            <ResultRow label="Participation Salariés" sansScopValue="-" avecScopValue={avecScop.montantParticipation} indent />
            <ResultRow label="Réserves Impartageables" sansScopValue="-" avecScopValue={avecScop.montantReserves} indent />
            <ResultRow label="Dividendes" sansScopValue="-" avecScopValue={avecScop.montantDividendes} indent />

            <tr className="bg-gray-50"><td colSpan={3} className="py-3 px-6 text-base font-semibold text-gray-500">DÉDUCTIONS FISCALES (SCOP)</td></tr>
            <ResultRow label="Déduction Participation" sansScopValue={0} avecScopValue={-avecScop.deductionParticipation} isPositive indent />
            <ResultRow label="Déduction Réserves (PPI)" sansScopValue={0} avecScopValue={-avecScop.deductionReserves} isPositive indent />

            <ResultRow label="Base imposable à l'IS" sansScopValue={sansScop.baseImposable} avecScopValue={avecScop.baseImposable} isBold />
            <ResultRow label="Impôt sur les Sociétés (IS)" sansScopValue={sansScop.is} avecScopValue={avecScop.is} isNegative />
            
            <tr className="bg-gray-100 font-bold">
              <td className="py-5 px-6 text-lg text-gray-800">Coût Fiscal Total</td>
              <td className="py-5 px-6 text-lg text-red-700 text-right">{formatCurrency(sansScop.coutFiscalTotal)}</td>
              <td className="py-5 px-6 text-lg text-green-700 text-right">{formatCurrency(avecScop.coutFiscalTotal)}</td>
            </tr>
            <tr className="bg-blue-50 font-bold text-blue-800">
              <td className="py-6 px-6 text-xl">Résultat Net Après IS</td>
              <td className="py-6 px-6 text-xl text-right">{formatCurrency(sansScop.resultatNet)}</td>
              <td className="py-6 px-6 text-xl text-right">{formatCurrency(avecScop.resultatNet)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section Analyse Graphique intégrée */}
      <div className="border-t border-gray-200 pt-8">
        <div className="flex items-center space-x-4 mb-6">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          <h3 className="text-3xl font-bold text-gray-800">Analyse Graphique</h3>
        </div>
        <p className="text-lg text-gray-600 mb-6">
          Comparaison visuelle des impacts fiscaux entre les deux régimes
        </p>
        
        <div className="h-80">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
    </Card>
  );
};

export default ResultsDisplay;
