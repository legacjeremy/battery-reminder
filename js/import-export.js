import { exportAllData, replaceAllData } from "./db.js";
export async function downloadJsonBackup() { const data = await exportAllData(); const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `battery-reminder-${new Date().toISOString().slice(0,10)}.json`; link.click(); URL.revokeObjectURL(url); }
export async function readJsonBackup(file) { return JSON.parse(await file.text()); }
export function validateImportedData(data) { return Boolean(data && Array.isArray(data.batteries) && Array.isArray(data.measurements)); }
export async function replaceWithImportedData(data) { if (!validateImportedData(data)) throw new Error("Fichier de sauvegarde invalide."); await replaceAllData(data); }
