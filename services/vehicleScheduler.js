const axios = require('axios');
require('dotenv').config();

const DEPOTS_URL = process.env.DEPOTS_URL;
const VEHICLES_URL = process.env.VEHICLES_URL;
const AUTH_TOKEN = process.env.AUTH_TOKEN;

if (!AUTH_TOKEN) {
    console.error('AUTH_TOKEN is missing in .env');
}

const headers = { Authorization: `Bearer ${AUTH_TOKEN}` };

async function fetchDepots() {
    console.log('Fetching depots...');
    const res = await axios.get(DEPOTS_URL, { headers, timeout: 5000 });
    return res.data?.depots || [];
}

async function fetchVehicles() {
    console.log('Fetching vehicles...');
    const res = await axios.get(VEHICLES_URL, { headers, timeout: 5000 });
    return res.data?.vehicles || [];
}

function knapsack(items, capacity) {
    const W = Math.floor(Number(capacity) || 0);
    if (W <= 0 || items.length === 0) return { selected: [], totalDuration: 0, totalImpact: 0 };

    const dp = new Array(W + 1).fill(0);
    const pick = new Array(W + 1).fill(-1);

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const wt = Math.floor(Number(item.Duration) || 0);
        const val = Number(item.Impact) || 0;
        if (wt <= 0 || wt > W) continue;

        for (let w = W; w >= wt; w--) {
            const candidate = dp[w - wt] + val;
            if (candidate > dp[w]) {
                dp[w] = candidate;
                pick[w] = i;
            }
        }
    }

    // reconstruct chosen items
    let w = W;
    const selected = [];
    while (w > 0 && pick[w] !== -1) {
        const item = items[pick[w]];
        selected.push(item);
        w -= Math.floor(Number(item.Duration) || 0);
    }

    const totalDuration = selected.reduce((sum, item) => sum + Number(item.Duration || 0), 0);
    const totalImpact = selected.reduce((sum, item) => sum + Number(item.Impact || 0), 0);

    return { selected: selected.reverse(), totalDuration, totalImpact };
}

async function runScheduler() {
    const depots = await fetchDepots();
    const vehicles = await fetchVehicles();

    const vehiclesByDepot = {};
    for (const depot of depots) {
        vehiclesByDepot[depot.ID] = [];
    }

    for (const vehicle of vehicles) {
        const depotId = vehicle.DepotID || vehicle.depotID || vehicle.depotId || vehicle.depot || vehicle.Depot;
        if (depotId && vehiclesByDepot[depotId]) {
            vehiclesByDepot[depotId].push(vehicle);
        } else {
            const firstDepot = Object.keys(vehiclesByDepot)[0];
            if (firstDepot) vehiclesByDepot[firstDepot].push(vehicle);
        }
    }

    const results = {};
    for (const depot of depots) {
        const items = (vehiclesByDepot[depot.ID] || []).filter(item => Number(item.Duration) > 0);
        const result = knapsack(items, depot.MechanicHours);
        results[depot.ID] = {
            depot,
            selectedTaskIDs: result.selected.map(item => item.TaskID || item.TaskId || item.id).filter(Boolean),
            totalDuration: result.totalDuration,
            totalImpact: result.totalImpact,
            selectedCount: result.selected.length,
        };
    }

    const output = { runAt: new Date().toISOString(), results };
    console.log(JSON.stringify(output, null, 2));
    return output;
}

module.exports = { runScheduler };

if (require.main === module) {
    runScheduler().catch(err => {
        console.error('Scheduler failed:', err.response?.data || err.message || err);
        process.exit(1);
    });
}
