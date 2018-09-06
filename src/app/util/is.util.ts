export function isPresent(obj: any): boolean {
  return obj !== undefined && obj !== null;
}

export function isBlank(obj: any): boolean {
  return obj === undefined || obj === null;
}

export function isString(obj: any): boolean {
  return typeof obj === "string";
}

export function isFunction(obj: any): boolean {
  return typeof obj === "function";
}

export function isType(obj: any): boolean {
  return isFunction(obj);
}

export function isStringMap(obj: any): boolean {
  return typeof obj === 'object' && obj !== null;
}

export function isPromise(obj: any): boolean {
  return obj instanceof Promise;
}

export function isArray(obj: any): boolean {
  return Array.isArray(obj);
}

export function isNumber(obj): boolean {
  return typeof obj === 'number';
}

export function isDate(obj): boolean {
  return obj instanceof Date && !isNaN(obj.valueOf());
}

export function isDefined(value: any): boolean {
  return value !== undefined && value !== null;
}
