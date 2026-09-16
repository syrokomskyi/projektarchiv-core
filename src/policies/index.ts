/*
<MODULE_CONTRACT>
<purpose>policies index — expose portable Projektarchiv scope, identity, lifecycle, and authority policy contracts.</purpose>
<non-goals>
  <item>Do not expose test adapters or add persistence and workflow behavior.</item>
</non-goals>
</MODULE_CONTRACT>
<CHANGE_SUMMARY>
  <item>RFC-1001: publish the pure policy surface.</item>
  <item>RFC-1097: sweep — tail packages clean

Sweep batch 3: rewrote ~95 purposes across werkstatt-knowledge, werkstatt-shared, godot-game, phaser-game, lifecycle-core, projektarchiv-*, portal-*, billing-*, typescript (CONTRACT-02/PURPOSE-02). Real KEY_DECISIONS on 5 godot utils, non-goals on 5 CONTRACT-03 files, headers on 4 headerless files, CS-07 history literal fix on 2 files. Policy: vitest.config.ts + test-fixtures testPatterns, worker-configuration.d.ts excludedPath. All non-site/engine packages now 0 diagnostics.</item>
</CHANGE_SUMMARY>
*/

export * from "./authority.ts";
export * from "./project-identity.ts";
export * from "./scope.ts";
export * from "./state.ts";
