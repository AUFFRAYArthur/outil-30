import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import Card from './Card';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ChartDisplayProps {
  results: any;
  duree: number;
}

const ChartDisplay: React.FC<ChartDisplayProps> = ({ results, duree }) => {
  const labels = Array.from({ length: duree }, (_, i) => `Année ${i + 1}`);

  const data = {
    labels,
    datasets: [
      {
        label: 'Résultat Net Cumulé (Sans SCOP)',
        data: labels.map((_, i) => results.sansScop.resultatNet * (i + 1)),
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
      },
      {
        label: 'Résultat Net Cumulé (Avec SCOP)',
        data: labels.map((_, i) => results.avecScop.resultatNet * (i + 1)),
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Évolution du Résultat Net Cumulé sur ${duree} an(s)`,
        font: {
          size: 16,
        }
      },
      tooltip: {
        callbacks: {
            label: function(context: any) {
                let label = context.dataset.label || '';
                if (label) {
                    label += ': ';
                }
                if (context.parsed.y !== null) {
                    label += new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(context.parsed.y);
                }
                return label;
            }
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: function(value: any) {
            return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
          }
        }
      }
    }
  };

  return (
    <Card>
      <div style={{ height: '400px' }}>
        <Bar options={options} data={data} />
      </div>
    </Card>
  );
};

export default ChartDisplay;
