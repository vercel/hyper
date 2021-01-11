declare module 'git-describe' {
  export function gitDescribe(...args: any[]): void;
}

declare module 'default-shell' {
  const val: string;
  export default val;
}

declare module 'native-reg' {
  export enum HKEY {
    CLASSES_ROOT = 2147483648,
    CURRENT_USER = 2147483649,
    LOCAL_MACHINE = 2147483650,
    USERS = 2147483651,
    PERFORMANCE_DATA = 2147483652,
    PERFORMANCE_TEXT = 2147483728,
    PERFORMANCE_NLSTEXT = 2147483744,
    CURRENT_CONFIG = 2147483653,
    DYN_DATA = 2147483654,
    CURRENT_USER_LOCAL_SETTINGS = 2147483655
  }
  export enum CreateKeyOptions {
    NON_VOLATILE = 0,
    VOLATILE = 1,
    CREATE_LINK = 2,
    BACKUP_RESTORE = 4
  }
  export enum OpenKeyOptions {
    OPEN_LINK = 8
  }
  export enum Access {
    QUERY_VALUE = 1,
    SET_VALUE = 2,
    CREATE_SUB_KEY = 4,
    ENUMERATE_SUB_KEYS = 8,
    NOTIFY = 16,
    CREATE_LINK = 32,
    WOW64_64KEY = 256,
    WOW64_32KEY = 512,
    READ = 131097,
    WRITE = 131078,
    EXECUTE = 131097,
    ALL_ACCESS = 983103
  }
  export enum ValueType {
    NONE = 0,
    SZ = 1,
    EXPAND_SZ = 2,
    BINARY = 3,
    DWORD = 4,
    DWORD_LITTLE_ENDIAN = 4,
    DWORD_BIG_ENDIAN = 5,
    LINK = 6,
    MULTI_SZ = 7,
    RESOURCE_LIST = 8,
    FULL_RESOURCE_DESCRIPTOR = 9,
    RESOURCE_REQUIREMENTS_LIST = 10,
    QWORD = 11,
    QWORD_LITTLE_ENDIAN = 11
  }
  export enum GetValueFlags {
    RT_ANY = 65535,
    RT_REG_NONE = 1,
    RT_REG_SZ = 2,
    RT_REG_EXPAND_SZ = 4,
    RT_REG_BINARY = 8,
    RT_REG_DWORD = 16,
    RT_REG_MULTI_SZ = 32,
    RT_REG_QWORD = 64,
    RT_DWORD = 24,
    RT_QWORD = 72,
    NO_EXPAND = 268435456,
    SUBKEY_WOW6464KEY = 65536,
    SUBKEY_WOW6432KEY = 131072
  }
  export const HKCR = HKEY.CLASSES_ROOT;
  export const HKCU = HKEY.CURRENT_USER;
  export const HKLM = HKEY.LOCAL_MACHINE;
  export const HKU = HKEY.USERS;
  export type Value = Buffer & {
    type: ValueType;
  };
  export function isHKEY(hkey: any): hkey is HKEY;
  export function createKey(hkey: HKEY, subKey: string, access: Access, options?: CreateKeyOptions): HKEY;
  export function openKey(hkey: HKEY, subKey: string, access: Access, options?: OpenKeyOptions): HKEY | null;
  export function openCurrentUser(access?: Access): HKEY;
  export function loadAppKey(file: string, access: Access): HKEY | null;
  export function enumKeyNames(hkey: HKEY): string[];
  export function enumValueNames(hkey: HKEY): string[];
  export function queryValueRaw(hkey: HKEY, valueName: string): Value | null;
  export function getValueRaw(hkey: HKEY, subKey: string, valueName: string, flags?: GetValueFlags): Value | null;
  export function setValueRaw(hkey: HKEY, valueName: string, valueType: ValueType, data: Buffer): void;
  export function deleteKey(hkey: HKEY, subKey: string): boolean;
  export function deleteTree(hkey: HKEY, subKey: string): boolean;
  export function deleteKeyValue(hkey: HKEY, subKey: string, valueName: string): boolean;
  export function deleteValue(hkey: HKEY, valueName: string): boolean;
  export function closeKey(hkey: HKEY | null | undefined): void;
  export type ParsedValue = number | string | string[] | Buffer;
  export function parseValue(value: Value | null): ParsedValue | null;
  export function parseString(value: Buffer): string;
  export function parseMultiString(value: Buffer): string[];
  export function formatString(value: string): Buffer;
  export function formatMultiString(values: string[]): Buffer;
  export function formatDWORD(value: number): Buffer;
  export function formatQWORD(value: number): Buffer;
  export function setValueSZ(hkey: HKEY, valueName: string, value: string): void;
  export function setValueEXPAND_SZ(hkey: HKEY, valueName: string, value: string): void;
  export function setValueMULTI_SZ(hkey: HKEY, valueName: string, value: string[]): void;
  export function setValueDWORD(hkey: HKEY, valueName: string, value: number): void;
  export function setValueQWORD(hkey: HKEY, valueName: string, value: number): void;
  export function getValue(hkey: HKEY, subKey: string, valueName: string, flags?: GetValueFlags): ParsedValue | null;
  export function queryValue(hkey: HKEY, valueName: string): ParsedValue | null;
}
