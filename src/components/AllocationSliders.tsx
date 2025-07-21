import React from 'react';
import InputSlider from './InputSlider';

interface AllocationSlidersProps {
  participation: number;
  reserves: number;
  dividendes: number;
  onChange: (name: 'pourcentageParticipation' | 'pourcentageReserves' | 'pourcentageDividendes', value: number) => void;
}

const AllocationSliders: React.FC<AllocationSlidersProps> = ({ participation, reserves, dividendes, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange(name as any, parseFloat(value));
  };

  return (
    <div className="p-6 border border-gray-200 rounded-lg space-y-6">
      <h3 className="text-2xl font-semibold text-gray-700">Affectation du Résultat</h3>
      <p className="text-base text-gray-500 mb-4">
        La répartition s'applique sur le résultat net après IS (et non sur le résultat fiscal)
      </p>
      <InputSlider
        label="Participation Salariés"
        tooltip="Part du résultat net distribuée aux salariés. Minimum 25%. 100% déductible fiscalement."
        value={participation}
        onChange={handleChange}
        min={25}
        max={100 - 16}
        step={1}
        unit="%"
        name="pourcentageParticipation"
      />
      <InputSlider
        label="Réserves Impartageables (PPI)"
        tooltip="Part du résultat net mise en réserve pour investissement. Minimum 16%. Déductible jusqu'à hauteur du % de participation."
        value={reserves}
        onChange={handleChange}
        min={16}
        max={100 - 25}
        step={1}
        unit="%"
        name="pourcentageReserves"
      />
      <InputSlider
        label="Dividendes"
        tooltip="Part du résultat net distribuée aux associés. Non déductible fiscalement."
        value={dividendes}
        onChange={handleChange}
        min={0}
        max={100 - 25 - 16}
        step={1}
        unit="%"
        name="pourcentageDividendes"
      />
    </div>
  );
};

export default AllocationSliders;
