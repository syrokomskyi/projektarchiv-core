/*
<MODULE_CONTRACT>
<purpose>Provide the stable public entrypoint for the provider-neutral Projektarchiv domain core package.</purpose>
<non-goals>
  <item>Do not import provider SDKs, deployment runtimes, services, sites, or other Warpgogol packages.</item>
  <item>Do not perform external I/O.</item>
</non-goals>
</MODULE_CONTRACT>
<CHANGE_SUMMARY>
  <item>RFC-1000: establish the intentionally empty portable-core entrypoint before PA-010.</item>
  <item>RFC-1001: publish identities, strict schemas, pure policies, results, and provider-neutral ports.</item>
</CHANGE_SUMMARY>
*/

export * from "./identities.ts";
export * from "./policies/index.ts";
export * from "./ports/index.ts";
export * from "./result.ts";
export * from "./schemas/index.ts";
