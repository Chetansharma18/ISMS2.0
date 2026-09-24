export interface SelectOption<T = string | number> {
  label: string;
  value: T;
  disabled?: boolean;
}

export interface KeyValuePair<K = string, V = any> {
  key: K;
  value: V;
}
