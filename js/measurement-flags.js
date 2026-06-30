const DB_NAME = "BattTrackDB";
const STORE = "measurements";

let lastMeasurementId = null;

document.addEventListener("click", event => {
  const row = event.target?.closest?.("[data-measurement-id]");
  if (row) lastMeasurementId = row.dataset.measurementId;
}, true);

document.addEventListener("submit", event => {
  const form = event.target;
  if (form?.id !== "measurement-form") return;
  window.battTrackPendingExcludeFromPrevious = Boolean(form.querySelector("[name='excludeFromPrevious']")?.checked);
}, true);

const observer = new MutationObserver(() => {
  enhanceMeasurementForm();
  decorateHistory();
});

observer.observe(document.body, { childList: true, subtree: true });

enhanceMeasurementForm();
decorateHistory();

async function enhanceMeasurementForm() {
  const form = document.querySelector("#measurement-form");
  if (!form || form.dataset.flagEnhanced) return;
  form.dataset.flagEnhanced = "true";

  const existing = lastMeasurementId ? await getMeasurement(lastMeasurementId) : null;
  const checked = existing?.excludeFromPrevious ? "checked" : "";
  const levelLabel = form.querySelector("[name='levelPercent']")?.closest("label");
  if (!levelLabel) return;

  levelLabel.insertAdjacentHTML("afterend", `
    <label class="checkbox-row">
      <input name="excludeFromPrevious" type="checkbox" ${checked}>
      <span>Exclure la baisse depuis la mesure précédente</span>
    </label>
    <p class="helper-text flagged-helper">À cocher si la batterie a été utilisée depuis la dernière mesure.</p>
  `);
}

async function decorateHistory() {
  const rows = [...document.querySelectorAll("[data-measurement-id]")];
  if (rows.length === 0) return;

  const measurements = await getAllMeasurements();
  const byId = new Map(measurements.map(measurement => [measurement.id, measurement]));

  for (const row of rows) {
    const measurement = byId.get(row.dataset.measurementId);
    if (!measurement?.excludeFromPrevious || row.dataset.flagDecorated) continue;
    row.dataset.flagDecorated = "true";
    row.classList.add("measurement-flagged");
    row.insertAdjacentHTML("beforeend", `<span class="badge badge-gray flagged-badge">Exclue</span>`);
  }
}

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function getAllMeasurements() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result ?? []);
  });
}

async function getMeasurement(id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, "readonly").objectStore(STORE).get(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result ?? null);
  });
}
