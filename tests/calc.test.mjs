import assert from "node:assert/strict";
import { calculate, formatDuration, ranking } from "../app.js";

const baseline = calculate({ salary: 3000, visits: 1, minutes: 15, days: 22, hours: 8 });
assert.equal(Number(baseline.perMonth.toFixed(2)), 93.75);
assert.equal(Number(baseline.perYear.toFixed(2)), 1125);
assert.equal(formatDuration(baseline.minutesPerMonth), "5,5 h");
assert.equal(ranking(baseline.perYear), "🏆 Profissional do bidê");

const noVisits = calculate({ salary: 5000, visits: 0, minutes: 20, days: 22, hours: 8 });
assert.equal(noVisits.perMonth, 0);
assert.equal(ranking(noVisits.perYear), "🧻 Bexiga de aço");

const defensive = calculate({ salary: -1000, visits: -1, minutes: -2, days: 0, hours: 0 });
assert.equal(defensive.perMonth, 0);
assert.equal(defensive.valuePerMinute, 0);

assert.equal(formatDuration(45), "45 min");
console.log("calc tests: ok");
