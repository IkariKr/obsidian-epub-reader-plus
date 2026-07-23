import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { resolve } from "node:path";

test("release bundle does not dynamically create script elements", () => {
	const bundle = readFileSync(resolve(process.cwd(), "main.js"), "utf8");

	assert.doesNotMatch(
		bundle,
		/\.createElement\(["']script["']\)/,
		"Release bundles must not include dynamic script injection.",
	);
});
