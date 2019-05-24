// To parse this data:
//
//   import { Convert, Services } from "./file";
//
//   const services = Convert.toServices(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface Services {
  status: Status;
  result: Result[];
}

export interface Result {
  id: string;
  display_name: string;
  business_name: string;
  time_zone: string;
  features: string[];
  created_at: number;
  updated_at: number;
  account: Account;
  plan: Plan;
  channels: Channel[];
  channel_types: ChannelType[];
  service_address: ServiceAddress;
  contact_groups: Contact[];
  contact_labels: Contact[];
  contact_custom_fields: ContactCustomField[];
  teams: Team[];
  templates: Template[];
  automations: Automation[];
  printers: any[];
  settings: Setting[];
  calendar_event_types: any[];
}

export interface Account {
  id: string;
  display_name: string;
  term_months: number;
  current_term_start_date: null;
  current_term_end_date: null;
  created_at: number;
  updated_at: number;
}

export interface Automation {
  id: string;
  uuid: string;
  display_name: string;
  type: string;
  status: string;
  is_global: boolean;
  created_at: number;
  triggers: Trigger[];
  actions: Action[];
  timeout_actions: any[];
  timeout_minutes: number;
  has_non_group_schedule_conditions: boolean;
  message_type: string;
  sort_order: number;
}

export interface Action {
  id: string;
  type: string;
  order: string;
  condition_outcome: string;
  after_step_then: string;
  properties: Properties;
  conditions: any[];
}

export interface Properties {}

export interface Trigger {
  id: string;
  type: string;
}

export interface ChannelType {
  id: string;
  code?: string;
  type_class: string;
  display_name: string;
  inbound_notification_url: null;
  outbound_notification_url: null;
  allow_communications: boolean;
}

export interface Channel {
  id: string;
  display_name: null;
  value: string;
  formatted_value: string;
  country: string;
  is_default_for_type: boolean;
  channel_type: ChannelType;
}

export interface ContactCustomField {
  code: string;
  id: string;
  display_name: string;
  data_type: DataType;
  replacement_variable: string;
  options: ContactCustomFieldOption[] | null;
  is_global?: boolean;
}

export enum DataType {
  Boolean = "boolean",
  Date = "date",
  Number = "number",
  SingleSelectOptions = "single_select_options",
  String = "string"
}

export interface ContactCustomFieldOption {
  value: string;
  display_name: string;
  sort_order: string;
  id: string;
}

export interface Contact {
  id: string;
  display_name: string;
  background_color: string;
  text_color: string;
  is_global?: boolean;
}

export interface Plan {
  id: string;
  code: string;
  term_months: number;
  monthly_or_unit_price: number;
  setup_price: number;
  display_name: string;
  is_printer_plan: boolean;
}

export interface ServiceAddress {
  address: string;
  city: string;
  state: null;
  country: string;
  postal_code: string;
}

export interface Setting {
  value: boolean | number | null | string;
  settings_field_option_id: null | string;
  settings_field: SettingsField;
}

export interface SettingsField {
  id: string;
  code: string;
  display_name: string;
  data_type: DataType;
  options: SettingsFieldOption[] | null;
}

export interface SettingsFieldOption {
  id: string;
  value: string;
  display_name: string;
  sort_order: number;
}

export interface Team {
  userIds: number[];
  id: string;
  display_name: string;
  emoji: string;
  user_ids: string[];
  created_at: number;
}

export interface Template {
  id: string;
  display_name: string;
  code: string;
  subject: null;
  type: string;
  body: string;
  is_global: boolean;
  team_id: null;
}

export interface Status {
  text: string;
  status_code: number;
  description: null;
  sort_field: string;
  sort_direction: string;
  page: number;
  page_size: number;
  total_pages: number;
  total_records: number;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
  public static toServices(json: string): Services {
    return cast(JSON.parse(json), r("Services"));
  }

  public static servicesToJson(value: Services): string {
    return JSON.stringify(uncast(value, r("Services")), null, 2);
  }
}

function invalidValue(typ: any, val: any): never {
  throw Error(
    `Invalid value ${JSON.stringify(val)} for type ${JSON.stringify(typ)}`
  );
}

function jsonToJSProps(typ: any): any {
  if (typ.jsonToJS === undefined) {
    var map: any = {};
    typ.props.forEach((p: any) => (map[p.json] = { key: p.js, typ: p.typ }));
    typ.jsonToJS = map;
  }
  return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
  if (typ.jsToJSON === undefined) {
    var map: any = {};
    typ.props.forEach((p: any) => (map[p.js] = { key: p.json, typ: p.typ }));
    typ.jsToJSON = map;
  }
  return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any): any {
  function transformPrimitive(typ: string, val: any): any {
    if (typeof typ === typeof val) return val;
    return invalidValue(typ, val);
  }

  function transformUnion(typs: any[], val: any): any {
    // val must validate against one typ in typs
    var l = typs.length;
    for (var i = 0; i < l; i++) {
      var typ = typs[i];
      try {
        return transform(val, typ, getProps);
      } catch (_) {}
    }
    return invalidValue(typs, val);
  }

  function transformEnum(cases: string[], val: any): any {
    if (cases.indexOf(val) !== -1) return val;
    return invalidValue(cases, val);
  }

  function transformArray(typ: any, val: any): any {
    // val must be an array with no invalid elements
    if (!Array.isArray(val)) return invalidValue("array", val);
    return val.map(el => transform(el, typ, getProps));
  }

  function transformDate(typ: any, val: any): any {
    if (val === null) {
      return null;
    }
    const d = new Date(val);
    if (isNaN(d.valueOf())) {
      return invalidValue("Date", val);
    }
    return d;
  }

  function transformObject(
    props: { [k: string]: any },
    additional: any,
    val: any
  ): any {
    if (val === null || typeof val !== "object" || Array.isArray(val)) {
      return invalidValue("object", val);
    }
    var result: any = {};
    Object.getOwnPropertyNames(props).forEach(key => {
      const prop = props[key];
      const v = Object.prototype.hasOwnProperty.call(val, key)
        ? val[key]
        : undefined;
      result[prop.key] = transform(v, prop.typ, getProps);
    });
    Object.getOwnPropertyNames(val).forEach(key => {
      if (!Object.prototype.hasOwnProperty.call(props, key)) {
        result[key] = transform(val[key], additional, getProps);
      }
    });
    return result;
  }

  if (typ === "any") return val;
  if (typ === null) {
    if (val === null) return val;
    return invalidValue(typ, val);
  }
  if (typ === false) return invalidValue(typ, val);
  while (typeof typ === "object" && typ.ref !== undefined) {
    typ = typeMap[typ.ref];
  }
  if (Array.isArray(typ)) return transformEnum(typ, val);
  if (typeof typ === "object") {
    return typ.hasOwnProperty("unionMembers")
      ? transformUnion(typ.unionMembers, val)
      : typ.hasOwnProperty("arrayItems")
      ? transformArray(typ.arrayItems, val)
      : typ.hasOwnProperty("props")
      ? transformObject(getProps(typ), typ.additional, val)
      : invalidValue(typ, val);
  }
  // Numbers can be parsed by Date but shouldn't be.
  if (typ === Date && typeof val !== "number") return transformDate(typ, val);
  return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
  return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
  return transform(val, typ, jsToJSONProps);
}

function a(typ: any) {
  return { arrayItems: typ };
}

function u(...typs: any[]) {
  return { unionMembers: typs };
}

function o(props: any[], additional: any) {
  return { props, additional };
}

function m(additional: any) {
  return { props: [], additional };
}

function r(name: string) {
  return { ref: name };
}

const typeMap: any = {
  Services: o(
    [
      { json: "status", js: "status", typ: r("Status") },
      { json: "result", js: "result", typ: a(r("Result")) }
    ],
    false
  ),
  Result: o(
    [
      { json: "id", js: "id", typ: "" },
      { json: "display_name", js: "display_name", typ: "" },
      { json: "business_name", js: "business_name", typ: "" },
      { json: "time_zone", js: "time_zone", typ: "" },
      { json: "features", js: "features", typ: a("") },
      { json: "created_at", js: "created_at", typ: 0 },
      { json: "updated_at", js: "updated_at", typ: 0 },
      { json: "account", js: "account", typ: r("Account") },
      { json: "plan", js: "plan", typ: r("Plan") },
      { json: "channels", js: "channels", typ: a(r("Channel")) },
      { json: "channel_types", js: "channel_types", typ: a(r("ChannelType")) },
      {
        json: "service_address",
        js: "service_address",
        typ: r("ServiceAddress")
      },
      { json: "contact_groups", js: "contact_groups", typ: a(r("Contact")) },
      { json: "contact_labels", js: "contact_labels", typ: a(r("Contact")) },
      {
        json: "contact_custom_fields",
        js: "contact_custom_fields",
        typ: a(r("ContactCustomField"))
      },
      { json: "teams", js: "teams", typ: a(r("Team")) },
      { json: "templates", js: "templates", typ: a(r("Template")) },
      { json: "automations", js: "automations", typ: a(r("Automation")) },
      { json: "printers", js: "printers", typ: a("any") },
      { json: "settings", js: "settings", typ: a(r("Setting")) },
      {
        json: "calendar_event_types",
        js: "calendar_event_types",
        typ: a("any")
      }
    ],
    false
  ),
  Account: o(
    [
      { json: "id", js: "id", typ: "" },
      { json: "display_name", js: "display_name", typ: "" },
      { json: "term_months", js: "term_months", typ: 0 },
      {
        json: "current_term_start_date",
        js: "current_term_start_date",
        typ: null
      },
      { json: "current_term_end_date", js: "current_term_end_date", typ: null },
      { json: "created_at", js: "created_at", typ: 0 },
      { json: "updated_at", js: "updated_at", typ: 0 }
    ],
    false
  ),
  Automation: o(
    [
      { json: "id", js: "id", typ: "" },
      { json: "uuid", js: "uuid", typ: "" },
      { json: "display_name", js: "display_name", typ: "" },
      { json: "type", js: "type", typ: "" },
      { json: "status", js: "status", typ: "" },
      { json: "is_global", js: "is_global", typ: true },
      { json: "created_at", js: "created_at", typ: 0 },
      { json: "triggers", js: "triggers", typ: a(r("Trigger")) },
      { json: "actions", js: "actions", typ: a(r("Action")) },
      { json: "timeout_actions", js: "timeout_actions", typ: a("any") },
      { json: "timeout_minutes", js: "timeout_minutes", typ: 0 },
      {
        json: "has_non_group_schedule_conditions",
        js: "has_non_group_schedule_conditions",
        typ: true
      },
      { json: "message_type", js: "message_type", typ: "" },
      { json: "sort_order", js: "sort_order", typ: 0 }
    ],
    false
  ),
  Action: o(
    [
      { json: "id", js: "id", typ: "" },
      { json: "type", js: "type", typ: "" },
      { json: "order", js: "order", typ: "" },
      { json: "condition_outcome", js: "condition_outcome", typ: "" },
      { json: "after_step_then", js: "after_step_then", typ: "" },
      { json: "properties", js: "properties", typ: r("Properties") },
      { json: "conditions", js: "conditions", typ: a("any") }
    ],
    false
  ),
  Properties: o([], false),
  Trigger: o(
    [{ json: "id", js: "id", typ: "" }, { json: "type", js: "type", typ: "" }],
    false
  ),
  ChannelType: o(
    [
      { json: "id", js: "id", typ: "" },
      { json: "code", js: "code", typ: u(undefined, "") },
      { json: "type_class", js: "type_class", typ: "" },
      { json: "display_name", js: "display_name", typ: "" },
      {
        json: "inbound_notification_url",
        js: "inbound_notification_url",
        typ: null
      },
      {
        json: "outbound_notification_url",
        js: "outbound_notification_url",
        typ: null
      },
      { json: "allow_communications", js: "allow_communications", typ: true }
    ],
    false
  ),
  Channel: o(
    [
      { json: "id", js: "id", typ: "" },
      { json: "display_name", js: "display_name", typ: null },
      { json: "value", js: "value", typ: "" },
      { json: "formatted_value", js: "formatted_value", typ: "" },
      { json: "country", js: "country", typ: "" },
      { json: "is_default_for_type", js: "is_default_for_type", typ: true },
      { json: "channel_type", js: "channel_type", typ: r("ChannelType") }
    ],
    false
  ),
  ContactCustomField: o(
    [
      { json: "code", js: "code", typ: "" },
      { json: "id", js: "id", typ: "" },
      { json: "display_name", js: "display_name", typ: "" },
      { json: "data_type", js: "data_type", typ: r("DataType") },
      { json: "replacement_variable", js: "replacement_variable", typ: "" },
      {
        json: "options",
        js: "options",
        typ: u(a(r("ContactCustomFieldOption")), null)
      },
      { json: "is_global", js: "is_global", typ: u(undefined, true) }
    ],
    false
  ),
  ContactCustomFieldOption: o(
    [
      { json: "value", js: "value", typ: "" },
      { json: "display_name", js: "display_name", typ: "" },
      { json: "sort_order", js: "sort_order", typ: "" },
      { json: "id", js: "id", typ: "" }
    ],
    false
  ),
  Contact: o(
    [
      { json: "id", js: "id", typ: "" },
      { json: "display_name", js: "display_name", typ: "" },
      { json: "background_color", js: "background_color", typ: "" },
      { json: "text_color", js: "text_color", typ: "" },
      { json: "is_global", js: "is_global", typ: u(undefined, true) }
    ],
    false
  ),
  Plan: o(
    [
      { json: "id", js: "id", typ: "" },
      { json: "code", js: "code", typ: "" },
      { json: "term_months", js: "term_months", typ: 0 },
      { json: "monthly_or_unit_price", js: "monthly_or_unit_price", typ: 0 },
      { json: "setup_price", js: "setup_price", typ: 0 },
      { json: "display_name", js: "display_name", typ: "" },
      { json: "is_printer_plan", js: "is_printer_plan", typ: true }
    ],
    false
  ),
  ServiceAddress: o(
    [
      { json: "address", js: "address", typ: "" },
      { json: "city", js: "city", typ: "" },
      { json: "state", js: "state", typ: null },
      { json: "country", js: "country", typ: "" },
      { json: "postal_code", js: "postal_code", typ: "" }
    ],
    false
  ),
  Setting: o(
    [
      { json: "value", js: "value", typ: u(true, 0, null, "") },
      {
        json: "settings_field_option_id",
        js: "settings_field_option_id",
        typ: u(null, "")
      },
      { json: "settings_field", js: "settings_field", typ: r("SettingsField") }
    ],
    false
  ),
  SettingsField: o(
    [
      { json: "id", js: "id", typ: "" },
      { json: "code", js: "code", typ: "" },
      { json: "display_name", js: "display_name", typ: "" },
      { json: "data_type", js: "data_type", typ: r("DataType") },
      {
        json: "options",
        js: "options",
        typ: u(a(r("SettingsFieldOption")), null)
      }
    ],
    false
  ),
  SettingsFieldOption: o(
    [
      { json: "id", js: "id", typ: "" },
      { json: "value", js: "value", typ: "" },
      { json: "display_name", js: "display_name", typ: "" },
      { json: "sort_order", js: "sort_order", typ: 0 }
    ],
    false
  ),
  Team: o(
    [
      { json: "userIds", js: "userIds", typ: a(0) },
      { json: "id", js: "id", typ: "" },
      { json: "display_name", js: "display_name", typ: "" },
      { json: "emoji", js: "emoji", typ: "" },
      { json: "user_ids", js: "user_ids", typ: a("") },
      { json: "created_at", js: "created_at", typ: 0 }
    ],
    false
  ),
  Template: o(
    [
      { json: "id", js: "id", typ: "" },
      { json: "display_name", js: "display_name", typ: "" },
      { json: "code", js: "code", typ: "" },
      { json: "subject", js: "subject", typ: null },
      { json: "type", js: "type", typ: "" },
      { json: "body", js: "body", typ: "" },
      { json: "is_global", js: "is_global", typ: true },
      { json: "team_id", js: "team_id", typ: null }
    ],
    false
  ),
  Status: o(
    [
      { json: "text", js: "text", typ: "" },
      { json: "status_code", js: "status_code", typ: 0 },
      { json: "description", js: "description", typ: null },
      { json: "sort_field", js: "sort_field", typ: "" },
      { json: "sort_direction", js: "sort_direction", typ: "" },
      { json: "page", js: "page", typ: 0 },
      { json: "page_size", js: "page_size", typ: 0 },
      { json: "total_pages", js: "total_pages", typ: 0 },
      { json: "total_records", js: "total_records", typ: 0 }
    ],
    false
  ),
  DataType: ["boolean", "date", "number", "single_select_options", "string"]
};
