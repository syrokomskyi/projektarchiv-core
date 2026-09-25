/*
<MODULE_CONTRACT>
<purpose>
RFC-1152 (Wave 4): ambient async-fs shim for projektarchiv-core testing helpers.
Projektarchiv-core has no werkstatt-shared dependency — direct async fs stays
ambient through this dedicated module (kernel-io-lint exclusion).
</purpose>
<non-goals>
  <item>Port plumbing — boundary-policy is a pure testing library with no kernel context.</item>
</non-goals>
<CHANGE_SUMMARY>
  <item>RFC-1152 Wave 4: initial ambient async fs shim.</item>
</CHANGE_SUMMARY>
*/

export { readFile, readdir } from "node:fs/promises";
