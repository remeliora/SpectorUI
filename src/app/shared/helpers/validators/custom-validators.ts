import { AbstractControl, FormArray, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validator, проверяющий, что все ключи в FormArray enumValues уникальны.
 * Ожидает, что FormArray состоит из FormGroup с полем 'key'.
 */
export function uniqueEnumKeysValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!(control instanceof FormArray)) {
      return null; // Не FormArray — Validator не применяется
    }

    const formArray = control;
    const keys: (number | null | undefined)[] = [];

    for (let i = 0; i < formArray.length; i++) {
      const group = formArray.at(i);
      const keyControl = group.get('key');
      if (keyControl) {
        const key = keyControl.value; // Тип: any, но ожидаем number,
        // игнорируем null/undefined значения, чтобы не мешать пользователю заполнять
        if (key != null) {
          keys.push(key);
        }
      }
    }

    // Проверяем уникальность
    const uniqueKeys = new Set<number>();
    for (const key of keys) {
      if (uniqueKeys.has(<number>key)) {
        // Нашли дубликат
        return { uniqueEnumKeys: { key } };
      }
      if (key != null) {
        uniqueKeys.add(key);
      }
    }

    return null; // Нет дубликатов
  };
}

/**
 * Validator для OID-адреса: ^\d+(?:\.\d+)*$
 */
export function oidValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null; // Если пусто, пусть required Validator обрабатывает
    const oidPattern = /^\d+(?:\.\d+)*$/;
    return oidPattern.test(value) ? null : { oid: true };
  };
}

/**
 * Validator, проверяющий, что число неотрицательное (>= 0), если оно есть
 */
export function nonNegativeNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value == null || value === '') return null; // Разрешаем null/undefined/пустую строку
    const numValue = Number(value);
    if (isNaN(numValue) || numValue < 0) {
      return { min: { min: 0, actual: numValue } };
    }
    return null;
  };
}

/**
 * Validator, для IP-адреса (IPv4)
 */
export function ipValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null; // Если пусто, пусть required валидатор обрабатывает

    // Регулярное выражение для проверки IPv4
    const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipPattern.test(value) ? null : { ip: true };
  };
}
