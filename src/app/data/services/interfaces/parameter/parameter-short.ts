export interface ParameterShort {
  id: number;
  name: string;
  description: string;
  dataType: string;
  enumeration: { [key: string]: string };
}
