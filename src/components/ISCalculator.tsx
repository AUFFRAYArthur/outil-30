import React, { useState, useEffect } from 'react';
import Card from './Card';
import Tooltip from './Tooltip';
import { Calculator } from 'lucide-react';

interface ISCalculatorProps {}

const ISCalculator: React.FC<ISCalculatorProps> = () => {
  const [plafondTauxReduit, setPlafondTauxReduit] = useState(42500);
  const [tauxReduit, setTauxReduit] = useState(15);
  const [resultatImposable, setResultatImposable] = useState(100000);
  const [calculIS, setCalculIS] = useState({
    montantTauxReduit: 0,
    isTauxReduit: 0,
    montantTauxNormal: 0,
    isTauxNormal: 0,
    totalIS: 0,
    detailCalcul: ''
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR', 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value}%`;
  };

  useEffect(() => {
    // Validation des données
    const plafond = Math.max(0, plafondTauxReduit);
    const taux = Math.max(0, Math.min(100, tauxReduit));
    const resultat = Math.max(0, resultatImposable);

    let montantTauxReduit = 0;
    let isTauxReduit = 0;
    let montantTauxNormal = 0;
    let isTauxNormal = 0;
    let totalIS = 0;
    let detailCalcul = '';

    if (resultat > 0) {
      if (plafond > 0 && taux > 0) {
        // Calcul avec taux progressif
        montantTauxReduit = Math.min(resultat, plafond);
        isTauxReduit = montantTauxReduit * (taux / 100);
        
        if (resultat > plafond) {
          montantTauxNormal = resultat - plafond;
          isTauxNormal = montantTauxNormal * 0.25; // 25% taux normal
        }
        
        totalIS = isTauxReduit + isTauxNormal;
        
        // Construction du détail de calcul
        detailCalcul = `Calcul détaillé de l'IS :\n`;
        detailCalcul += `• Montant soumis au taux réduit : ${formatCurrency(montantTauxReduit)} × ${formatPercentage(taux)} = ${formatCurrency(isTauxReduit)}\n`;
        
        if (montantTauxNormal > 0) {
          detailCalcul += `• Montant soumis au taux normal : ${formatCurrency(montantTauxNormal)} × 25% = ${formatCurrency(isTauxNormal)}\n`;
        }
        
        detailCalcul += `• Total IS = ${formatCurrency(totalIS)}`;
      } else {
        // Pas de taux réduit applicable, 25% sur la totalité
        montantTauxNormal = resultat;
        isTauxNormal = resultat * 0.25;
        totalIS = isTauxNormal;
        
        detailCalcul = `Calcul détaillé de l'IS :\n`;
        detailCalcul += `• Aucun taux réduit applicable\n`;
        detailCalcul += `• Montant total soumis au taux normal : ${formatCurrency(montantTauxNormal)} × 25% = ${formatCurrency(isTauxNormal)}\n`;
        detailCalcul += `• Total IS = ${formatCurrency(totalIS)}`;
      }
    }

    setCalculIS({
      montantTauxReduit,
      isTauxReduit,
      montantTauxNormal,
      isTauxNormal,
      totalIS,
      detailCalcul
    });
  }, [plafondTauxReduit, tauxReduit, resultatImposable]);

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<number>>) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value) || 0;
      setter(value);
    };

  return (
    <Card>
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <Calculator className="h-8 w-8 text-blue-600" />
          <h2 className="text-4xl font-bold text-gray-800">Calculateur d'Impôt sur les Sociétés (IS)</h2>
        </div>
        <p className="text-lg text-gray-600">
          Calcul automatique avec taux progressif selon la réglementation française
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section Paramètres */}
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">Paramètres de Calcul</h3>
          
          <div>
            <label htmlFor="resultatImposable" className="flex items-center space-x-2 text-lg font-medium text-gray-700 mb-3">
              <span>Résultat imposable (€)</span>
              <Tooltip text="Bénéfice imposable de l'entreprise avant application de l'IS." />
            </label>
            <input
              type="number"
              id="resultatImposable"
              value={resultatImposable}
              onChange={handleInputChange(setResultatImposable)}
              className="w-full p-4 text-lg border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: 100000"
              min="0"
            />
          </div>

          <div>
            <label htmlFor="plafondTauxReduit" className="flex items-center space-x-2 text-lg font-medium text-gray-700 mb-3">
              <span>Plafond IS au taux réduit (€)</span>
              <Tooltip text="Montant maximum de bénéfice pouvant bénéficier du taux réduit. Valeur standard : 42 500 €." />
            </label>
            <input
              type="number"
              id="plafondTauxReduit"
              value={plafondTauxReduit}
              onChange={handleInputChange(setPlafondTauxReduit)}
              className="w-full p-4 text-lg border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: 42500"
              min="0"
            />
          </div>

          <div>
            <label htmlFor="tauxReduit" className="flex items-center space-x-2 text-lg font-medium text-gray-700 mb-3">
              <span>Taux d'IS réduit (%)</span>
              <Tooltip text="Taux d'imposition réduit applicable sur la première tranche. Valeur standard : 15%." />
            </label>
            <input
              type="number"
              id="tauxReduit"
              value={tauxReduit}
              onChange={handleInputChange(setTauxReduit)}
              className="w-full p-4 text-lg border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: 15"
              min="0"
              max="100"
              step="0.1"
            />
          </div>
        </div>

        {/* Section Résultats */}
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">Résultat du Calcul</h3>
          
          <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
            <p className="text-lg text-blue-700 mb-2">Impôt sur les Sociétés Total</p>
            <p className="text-4xl font-bold text-blue-800">
              {formatCurrency(calculIS.totalIS)}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-4 px-6 text-left text-base font-semibold text-gray-500 uppercase tracking-wider">
                    Détail
                  </th>
                  <th className="py-4 px-6 text-right text-base font-semibold text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                <tr 
                  className="border-b border-gray-200 hover:bg-gray-50 cursor-help relative group"
                  title={calculIS.detailCalcul}
                >
                  <td className="py-4 px-6 text-lg text-gray-600 flex items-center space-x-2">
                    <span>Impôt sur les Sociétés (IS)</span>
                    <Tooltip text={calculIS.detailCalcul} />
                  </td>
                  <td className="py-4 px-6 text-lg font-medium text-right text-red-600">
                    {formatCurrency(calculIS.totalIS)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Détail visible du calcul */}
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-700 mb-3">Détail du Calcul</h4>
            <div className="text-base text-gray-600 space-y-2">
              {calculIS.montantTauxReduit > 0 && (
                <div className="flex justify-between">
                  <span>IS au taux réduit ({formatPercentage(tauxReduit)}) :</span>
                  <span className="font-medium">{formatCurrency(calculIS.isTauxReduit)}</span>
                </div>
              )}
              {calculIS.montantTauxNormal > 0 && (
                <div className="flex justify-between">
                  <span>IS au taux normal (25%) :</span>
                  <span className="font-medium">{formatCurrency(calculIS.isTauxNormal)}</span>
                </div>
              )}
              <div className="border-t border-gray-300 pt-2 flex justify-between font-semibold">
                <span>Total IS :</span>
                <span className="text-red-600">{formatCurrency(calculIS.totalIS)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ISCalculator;