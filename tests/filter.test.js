import assert from "node:assert/strict";
import test from "node:test";
import { filterBySearch } from "../src/utils/filter.js";

const records = [
  {
    id: 12,
    title: "Website refresh",
    members: ["Marina", "Sara"],
    dueDate: "2026-11-09",
    metadata: { status: "active" },
  },
  {
    id: 18,
    title: "Mobile app",
    members: ["Rana"],
    dueDate: "2026-12-01",
    metadata: { status: "done" },
  },
];

test("search matches every record field, including nested and array values", () => {
  assert.deepEqual(filterBySearch(records, "MARINA"), [records[0]]);
  assert.deepEqual(filterBySearch(records, "2026-12"), [records[1]]);
  assert.deepEqual(filterBySearch(records, "done"), [records[1]]);
  assert.deepEqual(filterBySearch(records, "18"), [records[1]]);
});

test("an empty or whitespace-only search returns every record", () => {
  assert.deepEqual(filterBySearch(records, ""), records);
  assert.deepEqual(filterBySearch(records, "   "), records);
});
