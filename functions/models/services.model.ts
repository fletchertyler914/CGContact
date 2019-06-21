export interface Services {
    status?: Status;
    result?: Result[];
}

export interface Result {
    id?:                  string;
    displayName?:         string;
    businessName?:        string;
    timeZone?:            string;
    features?:            string[];
    createdAt?:           number;
    updatedAt?:           number;
    account?:             Account;
    plan?:                Plan;
    channels?:            Channel[];
    channelTypes?:        ChannelType[];
    serviceAddress?:      ServiceAddress;
    contactGroups?:       Contact[];
    contactLabels?:       Contact[];
    contactCustomFields?: ContactCustomField[];
    teams?:               Team[];
    templates?:           Template[];
    automations?:         Automation[];
    printers?:            any[];
    settings?:            Setting[];
    calendarEventTypes?:  any[];
}

export interface Account {
    id?:                   string;
    displayName?:          string;
    termMonths?:           number;
    currentTermStartDate?: null;
    currentTermEndDate?:   null;
    createdAt?:            number;
    updatedAt?:            number;
}

export interface Automation {
    id?:                            string;
    uuid?:                          string;
    displayName?:                   string;
    type?:                          string;
    status?:                        string;
    isGlobal?:                      boolean;
    createdAt?:                     number;
    triggers?:                      Trigger[];
    actions?:                       Action[];
    timeoutActions?:                any[];
    timeoutMinutes?:                number;
    hasNonGroupScheduleConditions?: boolean;
    messageType?:                   string;
    sortOrder?:                     number;
}

export interface Action {
    id?:               string;
    type?:             string;
    order?:            string;
    conditionOutcome?: string;
    afterStepThen?:    string;
    properties?:       Properties;
    conditions?:       any[];
}

export interface Properties {
}

export interface Trigger {
    id?:   string;
    type?: string;
}

export interface ChannelType {
    id?:                      string;
    code?:                    string;
    typeClass?:               string;
    displayName?:             string;
    inboundNotificationURL?:  null;
    outboundNotificationURL?: null;
    allowCommunications?:     boolean;
}

export interface Channel {
    id?:               string;
    displayName?:      null;
    value?:            string;
    formattedValue?:   string;
    country?:          null | string;
    isDefaultForType?: boolean;
    channelType?:      ChannelType;
}

export interface ContactCustomField {
    code?:                string;
    id?:                  string;
    displayName?:         string;
    dataType?:            DataType;
    replacementVariable?: string;
    options?:             ContactCustomFieldOption[] | null;
    isGlobal?:            boolean;
}

export enum DataType {
    Boolean = "boolean",
    Date = "date",
    Number = "number",
    SingleSelectOptions = "single_select_options",
    String = "string",
}

export interface ContactCustomFieldOption {
    value?:       string;
    displayName?: string;
    sortOrder?:   string;
    id?:          string;
}

export interface Contact {
    id?:              string;
    displayName?:     string;
    backgroundColor?: string;
    textColor?:       string;
    isGlobal?:        boolean;
}

export interface Plan {
    id?:                 string;
    code?:               string;
    termMonths?:         number;
    monthlyOrUnitPrice?: number;
    setupPrice?:         number;
    displayName?:        string;
    isPrinterPlan?:      boolean;
}

export interface ServiceAddress {
    address?:    string;
    city?:       string;
    state?:      null;
    country?:    string;
    postalCode?: string;
}

export interface Setting {
    value?:                 Value;
    settingsFieldOptionID?: null | string;
    settingsField?:         SettingsField;
}

export interface SettingsField {
    id?:          string;
    code?:        string;
    displayName?: string;
    dataType?:    DataType;
    options?:     SettingsFieldOption[] | null;
}

export interface SettingsFieldOption {
    id?:          string;
    value?:       string;
    displayName?: string;
    sortOrder?:   number;
}

export type Value = boolean | number | null | string;

export interface Team {
    userIDS?:     number[];
    id?:          string;
    displayName?: string;
    emoji?:       string;
    teamUserIDS?: string[];
    createdAt?:   number;
}

export interface Template {
    id?:          string;
    displayName?: string;
    code?:        string;
    subject?:     null;
    type?:        string;
    body?:        string;
    isGlobal?:    boolean;
    teamID?:      null;
}

export interface Status {
    text?:          string;
    statusCode?:    number;
    description?:   null;
    sortField?:     string;
    sortDirection?: string;
    page?:          number;
    pageSize?:      number;
    totalPages?:    number;
    totalRecords?:  number;
}
