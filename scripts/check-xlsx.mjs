import xlsx from "xlsx";
import path from "path";
import os from "os";

const files = [
  path.join(os.homedir(), "Downloads", "mermer desenli pvc kaplama.xlsx"),
];

for (const filePath of files) {
  console.log("\n=== " + path.basename(filePath) + " ===");
  const wb = xlsx.readFile(filePath);
  console.log("Sheets:", wb.SheetNames);
  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(ws, { header: 1 });
    console.log(`\nSheet: ${sheetName} — ${rows.length} satır`);
    console.log("Kolonlar:", JSON.stringify(rows[0]));
    console.log("Satır 1:", JSON.stringify(rows[1]));
    console.log("Satır 2:", JSON.stringify(rows[2]));
  }
}
