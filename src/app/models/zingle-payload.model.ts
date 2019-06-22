export interface ZinglePayload {
  channels?: Channel[];
  custom_field_values?: CustomFieldValue[];
}

export interface Channel {
  channel_type_id?: string;
  value?: string;
}

export interface CustomFieldValue {
  value?: number | string;
  custom_field_id?: string;
}
