import { MEASUREMENT_TYPES, STATUS } from "./constants.js";
export function calculateBatteryStatus(battery, measurements, settings) {
  const sortedMeasurements = [...measurements].sort((a,b) => a.date.localeCompare(b.date));
  if (sortedMeasurements.length === 0) return createUninitializedStatus(battery.id);
  const cycles = buildCycles(sortedMeasurements); const points = normalizeMeasurementsByCycle(cycles); const regression = calculateLinearRegression(points); const lastMeasurement = sortedMeasurements.at(-1);
  const dischargePerDay = regression.slope < 0 ? Math.abs(regression.slope) : 0;
  const estimatedThresholdDate = calculateEstimatedThresholdDate(lastMeasurement.date, lastMeasurement.levelPercent, dischargePerDay, settings.criticalThresholdPercent);
  const status = calculateStatus({ lastLevelPercent: lastMeasurement.levelPercent, estimatedThresholdDate, settings });
  return { batteryId: battery.id, lastLevelPercent: lastMeasurement.levelPercent, lastMeasurementDate: lastMeasurement.date, lastChargeDate: getLastChargeDate(sortedMeasurements), measurementCount: sortedMeasurements.length, cycleCount: cycles.length, averageDischargePerDay: dischargePerDay, estimatedThresholdDate, status, confidence: calculateConfidence(points, regression.rmse) };
}
export function buildCycles(measurements) { const cycles = []; let currentCycle = []; for (const m of measurements) { if (m.type === MEASUREMENT_TYPES.CHARGE || currentCycle.length === 0) { if (currentCycle.length > 0) cycles.push(currentCycle); currentCycle = [m]; } else currentCycle.push(m); } if (currentCycle.length > 0) cycles.push(currentCycle); return cycles; }
export function normalizeMeasurementsByCycle(cycles) { const points = []; for (const cycle of cycles) { const start = cycle[0]; for (const m of cycle) points.push({ x: daysBetween(start.date, m.date), y: m.levelPercent, measurementId: m.id }); } return points; }
export function calculateLinearRegression(points) {
  if (points.length < 2) return { slope: 0, intercept: points[0]?.y ?? 0, rmse: null };
  const n = points.length, sumX = points.reduce((s,p)=>s+p.x,0), sumY = points.reduce((s,p)=>s+p.y,0), sumXY = points.reduce((s,p)=>s+p.x*p.y,0), sumXX = points.reduce((s,p)=>s+p.x*p.x,0);
  const denominator = n * sumXX - sumX * sumX; if (denominator === 0) return { slope: 0, intercept: sumY / n, rmse: null };
  const slope = (n * sumXY - sumX * sumY) / denominator; const intercept = (sumY - slope * sumX) / n;
  const rmse = Math.sqrt(points.map(p => Math.pow(p.y - (slope * p.x + intercept), 2)).reduce((s,v)=>s+v,0) / n);
  return { slope, intercept, rmse };
}
export function calculateEstimatedThresholdDate(referenceDate, lastLevelPercent, dischargePerDay, thresholdPercent) { if (lastLevelPercent <= thresholdPercent) return referenceDate; if (!dischargePerDay || dischargePerDay <= 0) return null; const d = new Date(`${referenceDate}T00:00:00`); d.setDate(d.getDate() + Math.ceil((lastLevelPercent - thresholdPercent) / dischargePerDay)); return d.toISOString().slice(0,10); }
export function calculateStatus({ lastLevelPercent, estimatedThresholdDate, settings }) { if (lastLevelPercent <= settings.criticalThresholdPercent) return STATUS.RED; if (!estimatedThresholdDate) return STATUS.GREEN; const days = daysBetween(new Date().toISOString().slice(0,10), estimatedThresholdDate); const percentBeforeCritical = lastLevelPercent - settings.criticalThresholdPercent; if (days <= 0) return STATUS.RED; if (days <= settings.orangeAlertDays || percentBeforeCritical <= settings.orangeAlertPercent) return STATUS.ORANGE; return STATUS.GREEN; }
export function calculateConfidence(points, rmse) { if (points.length < 2) return "inconnue"; if (points.length < 4) return "faible"; if (rmse !== null && rmse > 12) return "moyenne"; if (points.length < 8) return "moyenne"; return "bonne"; }
function createUninitializedStatus(batteryId) { return { batteryId, lastLevelPercent: null, lastMeasurementDate: null, lastChargeDate: null, measurementCount: 0, cycleCount: 0, averageDischargePerDay: 0, estimatedThresholdDate: null, status: STATUS.UNINITIALIZED, confidence: "inconnue" }; }
function getLastChargeDate(measurements) { return measurements.filter(m => m.type === MEASUREMENT_TYPES.CHARGE).at(-1)?.date ?? null; }
export function daysBetween(startDate, endDate) { const start = new Date(`${startDate}T00:00:00`); const end = new Date(`${endDate}T00:00:00`); return Math.round((end - start) / 86400000); }
export function calculateLossPerDay(previous, current) { const days = daysBetween(previous.date, current.date); if (days <= 0 || current.levelPercent >= previous.levelPercent) return null; return (previous.levelPercent - current.levelPercent) / days; }
