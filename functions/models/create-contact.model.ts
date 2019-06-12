// To parse this data:
//
//   import { Convert, CreateContact } from "./file";
//
//   const createContact = Convert.toCreateContact(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface CreateContact {
  status?: Status;
  result?: Result;
}

export interface Result {
  id?: string;
  title?: null;
  fullName?: string;
  notes?: null;
  external_id?: null;
  service_id?: string;
  first_name?: string;
  last_name?: string;
  assigned_to_team_id?: null;
  assigned_to_user_id?: null;
  is_messageable?: boolean;
  is_confirmed?: boolean;
  is_starred?: boolean;
  is_closed?: boolean;
  avatar_uri?: null;
  optin_status?: null;
  unconfirmed_at?: number;
  created_at?: number;
  updated_at?: number;
  locked_by_source?: null;
  last_message?: LastMessage;
  channels?: Channel[];
  custom_field_values?: CustomFieldValue[];
  labels?: any[];
  contact_groups?: ContactGroup[];
  calendar_events?: any[];
}

export interface Channel {
  id?: string;
  display_name?: string;
  value?: string;
  formatted_value?: string;
  country?: string;
  is_default?: boolean;
  is_default_for_type?: boolean;
  block_inbound?: boolean;
  block_outbound?: boolean;
  is_messageable?: boolean;
  channel_type?: ChannelType;
}

export interface ChannelType {
  id?: string;
  type_class?: string;
  display_name?: string;
  inbound_notification_url?: null;
  outbound_notification_url?: null;
  allow_communications?: boolean;
}

export interface ContactGroup {
  id?: string;
  display_name?: string;
  background_color?: string;
  text_color?: string;
}

export interface CustomFieldValue {
  dataTypeCode?: string;
  stringValue?: null;
  numberValue?: null;
  value?: number | null | string;
  selected_custom_field_option_id?: null;
  custom_field?: CustomField;
}

export interface CustomField {
  id?: string;
  display_name?: string;
  data_type?: string;
  code?: string;
  replacement_variable?: string;
  is_global?: boolean;
  options?: Option[] | null;
}

export interface Option {
  value?: string;
  display_name?: string;
  is_default?: string;
  sort_order?: string;
  id?: string;
}

export interface LastMessage {
  id?: null;
  body?: null;
  created_at?: null;
}

export interface Status {
  text?: string;
  status_code?: number;
  description?: null;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
  public static toCreateContact(json: string): CreateContact {
    return cast(JSON.parse(json), r("CreateContact"));
  }

  public static createContactToJson(value: CreateContact): string {
    return JSON.stringify(uncast(value, r("CreateContact")), null, 2);
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
  CreateContact: o(
    [
      { json: "status", js: "status", typ: u(undefined, r("Status")) },
      { json: "result", js: "result", typ: u(undefined, r("Result")) }
    ],
    false
  ),
  Result: o(
    [
      { json: "id", js: "id", typ: u(undefined, "") },
      { json: "title", js: "title", typ: u(undefined, null) },
      { json: "fullName", js: "fullName", typ: u(undefined, "") },
      { json: "notes", js: "notes", typ: u(undefined, null) },
      { json: "external_id", js: "external_id", typ: u(undefined, null) },
      { json: "service_id", js: "service_id", typ: u(undefined, "") },
      { json: "first_name", js: "first_name", typ: u(undefined, "") },
      { json: "last_name", js: "last_name", typ: u(undefined, "") },
      {
        json: "assigned_to_team_id",
        js: "assigned_to_team_id",
        typ: u(undefined, null)
      },
      {
        json: "assigned_to_user_id",
        js: "assigned_to_user_id",
        typ: u(undefined, null)
      },
      { json: "is_messageable", js: "is_messageable", typ: u(undefined, true) },
      { json: "is_confirmed", js: "is_confirmed", typ: u(undefined, true) },
      { json: "is_starred", js: "is_starred", typ: u(undefined, true) },
      { json: "is_closed", js: "is_closed", typ: u(undefined, true) },
      { json: "avatar_uri", js: "avatar_uri", typ: u(undefined, null) },
      { json: "optin_status", js: "optin_status", typ: u(undefined, null) },
      { json: "unconfirmed_at", js: "unconfirmed_at", typ: u(undefined, 0) },
      { json: "created_at", js: "created_at", typ: u(undefined, 0) },
      { json: "updated_at", js: "updated_at", typ: u(undefined, 0) },
      {
        json: "locked_by_source",
        js: "locked_by_source",
        typ: u(undefined, null)
      },
      {
        json: "last_message",
        js: "last_message",
        typ: u(undefined, r("LastMessage"))
      },
      { json: "channels", js: "channels", typ: u(undefined, a(r("Channel"))) },
      {
        json: "custom_field_values",
        js: "custom_field_values",
        typ: u(undefined, a(r("CustomFieldValue")))
      },
      { json: "labels", js: "labels", typ: u(undefined, a("any")) },
      {
        json: "contact_groups",
        js: "contact_groups",
        typ: u(undefined, a(r("ContactGroup")))
      },
      {
        json: "calendar_events",
        js: "calendar_events",
        typ: u(undefined, a("any"))
      }
    ],
    false
  ),
  Channel: o(
    [
      { json: "id", js: "id", typ: u(undefined, "") },
      { json: "display_name", js: "display_name", typ: u(undefined, "") },
      { json: "value", js: "value", typ: u(undefined, "") },
      { json: "formatted_value", js: "formatted_value", typ: u(undefined, "") },
      { json: "country", js: "country", typ: u(undefined, "") },
      { json: "is_default", js: "is_default", typ: u(undefined, true) },
      {
        json: "is_default_for_type",
        js: "is_default_for_type",
        typ: u(undefined, true)
      },
      { json: "block_inbound", js: "block_inbound", typ: u(undefined, true) },
      { json: "block_outbound", js: "block_outbound", typ: u(undefined, true) },
      { json: "is_messageable", js: "is_messageable", typ: u(undefined, true) },
      {
        json: "channel_type",
        js: "channel_type",
        typ: u(undefined, r("ChannelType"))
      }
    ],
    false
  ),
  ChannelType: o(
    [
      { json: "id", js: "id", typ: u(undefined, "") },
      { json: "type_class", js: "type_class", typ: u(undefined, "") },
      { json: "display_name", js: "display_name", typ: u(undefined, "") },
      {
        json: "inbound_notification_url",
        js: "inbound_notification_url",
        typ: u(undefined, null)
      },
      {
        json: "outbound_notification_url",
        js: "outbound_notification_url",
        typ: u(undefined, null)
      },
      {
        json: "allow_communications",
        js: "allow_communications",
        typ: u(undefined, true)
      }
    ],
    false
  ),
  ContactGroup: o(
    [
      { json: "id", js: "id", typ: u(undefined, "") },
      { json: "display_name", js: "display_name", typ: u(undefined, "") },
      {
        json: "background_color",
        js: "background_color",
        typ: u(undefined, "")
      },
      { json: "text_color", js: "text_color", typ: u(undefined, "") }
    ],
    false
  ),
  CustomFieldValue: o(
    [
      { json: "dataTypeCode", js: "dataTypeCode", typ: u(undefined, "") },
      { json: "stringValue", js: "stringValue", typ: u(undefined, null) },
      { json: "numberValue", js: "numberValue", typ: u(undefined, null) },
      { json: "value", js: "value", typ: u(undefined, u(0, null, "")) },
      {
        json: "selected_custom_field_option_id",
        js: "selected_custom_field_option_id",
        typ: u(undefined, null)
      },
      {
        json: "custom_field",
        js: "custom_field",
        typ: u(undefined, r("CustomField"))
      }
    ],
    false
  ),
  CustomField: o(
    [
      { json: "id", js: "id", typ: u(undefined, "") },
      { json: "display_name", js: "display_name", typ: u(undefined, "") },
      { json: "data_type", js: "data_type", typ: u(undefined, "") },
      { json: "code", js: "code", typ: u(undefined, "") },
      {
        json: "replacement_variable",
        js: "replacement_variable",
        typ: u(undefined, "")
      },
      { json: "is_global", js: "is_global", typ: u(undefined, true) },
      {
        json: "options",
        js: "options",
        typ: u(undefined, u(a(r("Option")), null))
      }
    ],
    false
  ),
  Option: o(
    [
      { json: "value", js: "value", typ: u(undefined, "") },
      { json: "display_name", js: "display_name", typ: u(undefined, "") },
      { json: "is_default", js: "is_default", typ: u(undefined, "") },
      { json: "sort_order", js: "sort_order", typ: u(undefined, "") },
      { json: "id", js: "id", typ: u(undefined, "") }
    ],
    false
  ),
  LastMessage: o(
    [
      { json: "id", js: "id", typ: u(undefined, null) },
      { json: "body", js: "body", typ: u(undefined, null) },
      { json: "created_at", js: "created_at", typ: u(undefined, null) }
    ],
    false
  ),
  Status: o(
    [
      { json: "text", js: "text", typ: u(undefined, "") },
      { json: "status_code", js: "status_code", typ: u(undefined, 0) },
      { json: "description", js: "description", typ: u(undefined, null) }
    ],
    false
  )
};
