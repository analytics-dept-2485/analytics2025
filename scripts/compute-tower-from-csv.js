#!/usr/bin/env node
/**
 * Compute tower values/ranking from a scouting CSV using the same logic as the picklist API.
 * Usage: node scripts/compute-tower-from-csv.js "/path/to/file.csv"
 */

const fs = require('fs');
const path = require('path');

function parseCSVLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (inQuotes) {
      cur += c;
    } else if (c === ',') {
      out.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  out.push(cur.trim());
  return out;
}

function rowToObject(header, values) {
  const obj = {};
  header.forEach((h, i) => { obj[h] = values[i]; });
  return obj;
}

// Same logic as compute-picklist/route.js and verify-picklist/route.js
function towerPointsFromRow(row) {
  const endclimb = row.endclimbposition;
  if (endclimb != null && endclimb !== undefined && endclimb !== '') {
    const level = Number(endclimb) % 3;
    if (level === 0) return 30;
    if (level === 1) return 20;
    if (level === 2) return 10;
    return 0;
  }
  const loc = Math.round(Number(row.endlocation) || 0);
  if (loc === 2) return 6;
  if (loc === 3) return 12;
  return 0;
}

const csvPath = process.argv[2] || path.join(process.env.HOME || '', 'Downloads', 'scc2025 (2).csv');
const raw = fs.readFileSync(csvPath, 'utf8');
const lines = raw.split(/\r?\n/).filter(Boolean);
if (lines.length < 2) {
  console.error('CSV needs at least a header and one data row.');
  process.exit(1);
}

const header = parseCSVLine(lines[0]);
const rows = lines.slice(1).map((line) => rowToObject(header, parseCSVLine(line)));

const teamTowerMap = {};
rows.forEach((row) => {
  const team = String(row.team || '').trim();
  if (!team) return;
  if (!teamTowerMap[team]) teamTowerMap[team] = { sum: 0, count: 0, points: [] };
  const pts = towerPointsFromRow(row);
  teamTowerMap[team].sum += pts;
  teamTowerMap[team].count += 1;
  teamTowerMap[team].points.push(pts);
});

const teamTowerAvg = {};
Object.keys(teamTowerMap).forEach((team) => {
  const t = teamTowerMap[team];
  teamTowerAvg[team] = t.count > 0 ? t.sum / t.count : 0;
});

const sorted = Object.entries(teamTowerAvg)
  .sort((a, b) => b[1] - a[1])
  .map(([team], i) => ({ team, tower: teamTowerAvg[team], rank: i + 1, ...teamTowerMap[team] }));

console.log('\nTower values & ranking (same logic as picklist API)\n');
console.log('Formula: endclimbposition % 3 → 0=L3=30, 1=L2=20, 2=L1=10; else endlocation 2=6, 3=12. Team value = average points per match.\n');
console.log('Rank | Team   | Tower (avg) | Matches | Per-match points');
console.log('-----|--------|-------------|--------|------------------');
sorted.forEach(({ team, tower, rank, count, points }) => {
  const ptsStr = points.join(', ');
  console.log(`${String(rank).padStart(4)} | ${team.padEnd(6)} | ${tower.toFixed(2).padStart(11)} | ${String(count).padStart(6)} | ${ptsStr}`);
});
console.log('');
