import { AbstractControl, FormArray, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Валидатор, проверяющий, что все ключи в FormArray enumValues уникальны.
 * Ожидает, что FormArray состоит из FormGroup с полем 'key'.
 */
export function uniqueEnumKeysValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!(control instanceof FormArray)) {
      return null; // Не FormArray — валидатор не применяется
    }

    const formArray = control;
    const keys: (number | null | undefined)[] = [];

    for (let i = 0; i < formArray.length; i++) {
      const group = formArray.at(i);
      const keyControl = group.get('key');
      if (keyControl) {
        const key = keyControl.value; // Тип: any, но ожидаем number
        // Игнорируем null/undefined значения, чтобы не мешать пользователю заполнять
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

export function isNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    // Если значение - строка, пробуем преобразовать в число
    if (typeof value === 'string') {
      // Проверяем, что строка не пустая и не содержит только пробелы
      if (value.trim() === '') {
        return null; // Пустая строка - пусть required валидатор обрабатывает
      }

      const numValue = Number(value);
      // Проверяем, что строка - это валидное число и не NaN, и не "123abc"
      if (isNaN(numValue) || value.trim() !== numValue.toString()) {
        return { isNumber: true };
      }
      // Если строка - валидное число (например "123")
      return null;
    }

    // Если значение - число
    if (typeof value === 'number' && !isNaN(value)) {
      return null;
    }

    // Если значение null/undefined, пусть required валидатор обрабатывает
    if (value == null) {
      return null;
    }

    // Любое другое значение (например, boolean, object) - ошибка
    return { isNumber: true };
  };
}
