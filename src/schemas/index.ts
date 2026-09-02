/*
<MODULE_CONTRACT>
<purpose>Expose the stable public schema and inferred-type surface of the portable Projektarchiv core package.</purpose>
<non-goals>
  <item>Do not export test fixtures, provider schemas, or adapter implementations.</item>
</non-goals>
</MODULE_CONTRACT>
<CHANGE_SUMMARY>
  <item>RFC-1001: publish all canonical Projektarchiv version-one record schemas and types.</item>
</CHANGE_SUMMARY>
*/

export * from "./records.ts";
