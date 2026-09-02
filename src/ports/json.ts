/*
<MODULE_CONTRACT>
<purpose>Define runtime-neutral JSON value contracts for opaque provider metadata and catalog record payloads.</purpose>
<non-goals>
  <item>Do not admit functions, class instances, credentials, or provider SDK objects.</item>
</non-goals>
</MODULE_CONTRACT>
<CHANGE_SUMMARY>
  <item>RFC-1001: add portable recursive JSON value types.</item>
</CHANGE_SUMMARY>
*/

export type JsonPrimitive = boolean | number | string | null;
export type JsonValue = JsonPrimitive | JsonObject | readonly JsonValue[];
export interface JsonObject {
  readonly [key: string]: JsonValue;
}
