import React from 'react';
import Card from './Card';
import Tooltip from './Tooltip';
import AllocationSliders from './AllocationSliders';

interface SimulatorFormProps {
  inputs: any;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onAllocationChange: (name: 'pourcentageParticipation' | 'pourcentageReserves' | 'pourcentageDividendes', value: number) => void;
}

const SimulatorForm: React.FC<SimulatorFormProps> = ({ inputs, onInputChange, onAllocationChange }) => {
  return (
    <Card>
      <h2 className="text-4xl font-bold text-gray-800 mb-8">Paramètres de Simulation</h2>
      <div className="space-y-6">
        <div>
          <label htmlFor="resultatFiscal" className="flex items-center space-x-2 text-lg font-medium text-gray-700 mb-3">
            <span>Résultat fiscal prévisionnel (€)</span>
            <Tooltip text="Bénéfice imposable prévu avant application du régime SCOP." />
          </label>
          <input
            type="number"
            name="resultatFiscal"
            id="resultatFiscal"
            value={inputs.resultatFiscal}
            onChange={onInputChange}
            className="w-full p-4 text-lg border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: 100000"
          />
        </div>
        <div>
          <label htmlFor="cet" className="flex items-center space-x-2 text-lg font-medium text-gray-700 mb-3">
            <span>Montant annuel de la CET actuelle (€)</span>
            <Tooltip text="Total annuel de Contribution Économique Territoriale (CFE + CVAE)." />
          </label>
          <input
            type="number"
            name="cet"
            id="cet"
            value={inputs.cet}
            onChange={onInputChange}
            className="w-full p-4 text-lg border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: 5000"
          />
        </div>
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <input
              type="checkbox"
              name="enableTauxReduit"
              id="enableTauxReduit"
              checked={inputs.plafondTauxReduit > 0 && inputs.tauxISReduit > 0}
              onChange={(e) => {
                if (e.target.checked) {
                  onInputChange({ target: { name: 'plafondTauxReduit', value: '42500' } } as any);
                  onInputChange({ target: { name: 'tauxISReduit', value: '15' } } as any);
                } else {
                  onInputChange({ target: { name: 'plafondTauxReduit', value: '0' } } as any);
                  onInputChange({ target: { name: 'tauxISReduit', value: '0' } } as any);
                }
              }}
              className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="enableTauxReduit" className="text-lg font-medium text-gray-700">
              Activer le taux d'IS réduit
            </label>
            <Tooltip text="Cochez cette option pour appliquer un taux d'IS réduit sur une partie des bénéfices selon les critères d'éligibilité." />
          </div>
        </div>
        
        {(inputs.plafondTauxReduit > 0 && inputs.tauxISReduit > 0) && (
          <>
            <div>
              <label htmlFor="plafondTauxReduit" className="flex items-center space-x-2 text-lg font-medium text-gray-700 mb-3">
                <span>Plafond d'assiette au taux réduit (€)</span>
                <Tooltip text="Montant maximum de bénéfice pouvant bénéficier du taux d'IS réduit. Valeur standard : 42 500 €." />
              </label>
              <input
                type="number"
                name="plafondTauxReduit"
                id="plafondTauxReduit"
                value={inputs.plafondTauxReduit}
                onChange={onInputChange}
                className="w-full p-4 text-lg border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: 42500"
                min="0"
              />
            </div>
            <div>
              <label htmlFor="tauxISReduit" className="flex items-center space-x-2 text-lg font-medium text-gray-700 mb-3">
                <span>Taux d'IS réduit (%)</span>
                <Tooltip text="Taux d'imposition réduit applicable sur la première tranche de bénéfice. Valeur standard : 15%." />
              </label>
              <input
                type="number"
                name="tauxISReduit"
                id="tauxISReduit"
                value={inputs.tauxISReduit}
                onChange={onInputChange}
                className="w-full p-4 text-lg border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: 15"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
          </>
        )}
        
        <div>
          <label htmlFor="tauxIS" className="flex items-center space-x-2 text-lg font-medium text-gray-700 mb-3">
            <span>Taux d’impôt sur les sociétés (IS) (%)</span>
            <Tooltip text="Taux d'imposition appliqué sur les bénéfices. Le taux normal est de 25%. Saisissez la valeur souhaitée." />
          </label>
          <input
            type="number"
            name="tauxIS"
            id="tauxIS"
            value={inputs.tauxIS}
            onChange={onInputChange}
            className="w-full p-4 text-lg border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: 25"
            step="0.1"
          />
        </div>
        
        <AllocationSliders 
          participation={inputs.pourcentageParticipation}
          reserves={inputs.pourcentageReserves}
          dividendes={inputs.pourcentageDividendes}
          onChange={onAllocationChange}
        />

        <div>
          <label htmlFor="dureeInvestissement" className="flex items-center space-x-2 text-lg font-medium text-gray-700 mb-3">
            <span>Durée d’investissement prévue (années)</span>
            <Tooltip text="Horizon temporel pour réaliser l'investissement correspondant à la PPI (généralement 4 ans)." />
          </label>
          <input
            type="number"
            name="dureeInvestissement"
            id="dureeInvestissement"
            value={inputs.dureeInvestissement}
            onChange={onInputChange}
            min="1"
            max="10"
            className="w-full p-4 text-lg border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: 4"
          />
        </div>
      </div>
    </Card>
  );
};

export default SimulatorForm;
