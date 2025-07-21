import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import Card from './Card';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ChartDisplayProps {
  results: any;
}

const formatCurrency = (value: number) => {
  if (isNaN(value)) return 'N/A';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
};

const ChartDisplay: React.FC<ChartDisplayProps> = ({ results }) => {
  const { sansScop, avecScop, economies } = results;

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Comparaison Fiscale : Sans SCOP vs Avec SCOP',
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return context.dataset.label + ': ' + formatCurrency(context.parsed.y);
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
    }
  };

  const data = {
    labels: ['Impôt sur les Sociétés', 'CET', 'Coût Fiscal Total', 'Résultat Net'],
    datasets: [
      {
        label: 'Sans SCOP',
        data: [sansScop.is || 0, sansScop.cet || 0, sansScop.coutFiscalTotal || 0, sansScop.resultatNet || 0],
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
      },
      {
        label: 'Avec SCOP',
        data: [avecScop.is || 0, avecScop.cet || 0, avecScop.coutFiscalTotal || 0, avecScop.resultatNet || 0],
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <Card>
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Analyse Graphique</h2>
        <p className="text-sm text-gray-600">Comparaison visuelle des impacts fiscaux</p>
      </div>
      <div className="h-96">
        <Bar options={options} data={data} />
      </div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
          <p className="text-sm text-green-700">Économie d'IS</p>
          <p className="text-lg font-bold text-green-800">{formatCurrency(economies.is || 0)}</p>
        </div>
        <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
          <p className="text-sm text-green-700">Économie de CET</p>
          <p className="text-lg font-bold text-green-800">{formatCurrency(economies.cet || 0)}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
          <p className="text-sm text-blue-700">Gain Total</p>
          <p className="text-lg font-bold text-blue-800">{formatCurrency(economies.total || 0)}</p>
        </div>
      </div>
    </Card>
  );
};

export default ChartDisplay;