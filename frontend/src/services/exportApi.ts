// Uses fetch internally since it downloads blobs
export async function downloadExport(path: string, filename: string) {
  const token = localStorage.getItem('fitos_token');
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const res = await fetch(`${baseURL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Export failed');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const exportWorkoutCSV    = () => downloadExport('/export/csv',           'fitos-workouts.csv');
export const exportNutritionCSV  = () => downloadExport('/export/nutrition-csv', 'fitos-nutrition.csv');
export const exportWeightCSV     = () => downloadExport('/export/weight-csv',    'fitos-weight.csv');
