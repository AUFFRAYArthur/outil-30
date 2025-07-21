import React from 'react';
import Card from './Card';
import { TrendingUp } from 'lucide-react';

interface ResultsDisplayProps {
  results: any;
}

const formatCurrency = (value: number) => {
  if (isNaN(value)) return 'N/A';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
};

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  const { sansScop, avecScop, economies } = results;

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
            <td className={`py-2 px-4 text-sm ${isBold ? 'text-gray-800' : 'text-gray-600'} ${indent ? 'pl-8' : ''}`}>{label}</td>
            <td className={`py-2 px-4 text-sm font-medium text-right ${isSubtle ? 'text-gray-400' : 'text-gray-800'}`}>{formatValue(sansScopValue)}</td>
            <td className={`py-2 px-4 text-sm font-medium text-right ${isSubtle ? 'text-gray-400' : valueClass}`}>{formatValue(avecScopValue)}</td>
        </tr>
    );
  };

  return (
    <Card className="flex flex-col h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Résultats Comparatifs</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center">
          <p className="text-sm text-green-700">Économie d'IS</p>
          <p className="text-xl font-bold text-green-800 flex items-center justify-center space-x-1">
            <TrendingUp size={20} />
            <span>{formatCurrency(economies.is)}</span>
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center">
          <p className="text-sm text-green-700">Économie de CET</p>
          <p className="text-xl font-bold text-green-800 flex items-center justify-center space-x-1">
            <TrendingUp size={20} />
            <span>{formatCurrency(economies.cet)}</span>
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-center">
          <p className="text-sm text-blue-700">Gain Fiscal Total Annuel</p>
          <p className="text-xl font-bold text-blue-800 flex items-center justify-center space-x-1">
            <TrendingUp size={20} />
            <span>{formatCurrency(economies.total)}</span>
          </p>
        </div>
      </div>

      <div className="flex-grow overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Indicateur</th>
              <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Sans SCOP</th>
              <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Avec SCOP</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            <ResultRow label="Résultat fiscal avant affectation" sansScopValue={sansScop.resultatFiscal} avecScopValue={avecScop.resultatFiscal} isBold />
            
            <ResultRow label="Contribution Économique (CET)" sansScopValue={sansScop.cet} avecScopValue={avecScop.cet} isNegative />
            
            <tr className="bg-gray-50"><td colSpan={3} className="py-1 px-4 text-xs font-semibold text-gray-500">TRAITEMENT FISCAL SCOP</td></tr>
            <ResultRow label="Base imposable avant déductions" sansScopValue={sansScop.baseImposable} avecScopValue={avecScop.baseImposableAvantDeductions} indent />
            
            <tr className="bg-gray-50"><td colSpan={3} className="py-1 px-4 text-xs font-semibold text-gray-500">AFFECTATION DU RÉSULTAT (SCOP)</td></tr>
            <ResultRow label="Participation Salariés" sansScopValue="-" avecScopValue={avecScop.montantParticipation} indent />
            <ResultRow label="Réserves Impartageables" sansScopValue="-" avecScopValue={avecScop.montantReserves} indent />
            <ResultRow label="Dividendes" sansScopValue="-" avecScopValue={avecScop.montantDividendes} indent />

            <tr className="bg-gray-50"><td colSpan={3} className="py-1 px-4 text-xs font-semibold text-gray-500">DÉDUCTIONS FISCALES (SCOP)</td></tr>
            <ResultRow label="Déduction Participation" sansScopValue={0} avecScopValue={-avecScop.deductionParticipation} isPositive indent />
            <ResultRow label="Déduction Réserves (PPI)" sansScopValue={0} avecScopValue={-avecScop.deductionReserves} isPositive indent />

            <ResultRow label="Base imposable à l'IS" sansScopValue={sansScop.baseImposable} avecScopValue={avecScop.baseImposable} isBold />
            <ResultRow label="Impôt sur les Sociétés (IS)" sansScopValue={sansScop.is} avecScopValue={avecScop.is} isNegative />
            
            <tr className="bg-gray-100 font-bold">
              <td className="py-3 px-4 text-sm text-gray-800">Coût Fiscal Total</td>
              <td className="py-3 px-4 text-sm text-red-700 text-right">{formatCurrency(sansScop.coutFiscalTotal)}</td>
              <td className="py-3 px-4 text-sm text-green-700 text-right">{formatCurrency(avecScop.coutFiscalTotal)}</td>
            </tr>
            <tr className="bg-blue-50 font-bold text-blue-800">
              <td className="py-4 px-4 text-md">Résultat Net Après IS</td>
              <td className="py-4 px-4 text-md text-right">{formatCurrency(sansScop.resultatNet)}</td>
              <td className="py-4 px-4 text-md text-right">{formatCurrency(avecScop.resultatNet)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default ResultsDisplay;
