/*
<MODULE_CONTRACT>
<purpose>index — provide the stable public entrypoint for the provider-neutral Projektarchiv domain core package.</purpose>
<non-goals>
  <item>Do not import provider SDKs, deployment runtimes, services, sites, or other Warpgogol packages.</item>
  <item>Do not perform external I/O.</item>
</non-goals>
</MODULE_CONTRACT>
<CHANGE_SUMMARY>
  <item>RFC-1000: establish the intentionally empty portable-core entrypoint before PA-010.</item>
  <item>RFC-1001: publish identities, strict schemas, pure policies, results, and provider-neutral ports.</item>
  <item>RFC-1097: sweep — tail packages clean

Sweep batch 3: rewrote ~95 purposes across werkstatt-knowledge, werkstatt-shared, godot-game, phaser-game, lifecycle-core, projektarchiv-*, portal-*, billing-*, typescript (CONTRACT-02/PURPOSE-02). Real KEY_DECISIONS on 5 godot utils, non-goals on 5 CONTRACT-03 files, headers on 4 headerless files, CS-07 history literal fix on 2 files. Policy: vitest.config.ts + test-fixtures testPatterns, worker-configuration.d.ts excludedPath. All non-site/engine packages now 0 diagnostics.</item>
</CHANGE_SUMMARY>
*/

export * from "./identities.ts";
export * from "./policies/index.ts";
export * from "./ports/index.ts";
export * from "./result.ts";
export * from "./schemas/index.ts";
