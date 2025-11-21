export function handleNumberInputKeyDown (event: KeyboardEvent): void {
  // Разрешённые клавиши
  const allowedKeys = [
    'Backspace', 'Tab', 'Enter', 'Escape', 'Delete',
    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
    'Home', 'End', 'Shift', 'Control', 'Alt', 'Meta'
  ];

  // Разрешаем Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X и т.д.
  if (event.ctrlKey || event.metaKey) return;


  // Проверяем, является ли нажатая клавиша цифрой
  if (event.key >= '0' && event.key <= '9') return;

  // Разрешаем точку (десятичный разделитель)
  if (event.key === '.') {
    const input = event.target as HTMLInputElement;
    // Проверяем, что точка ещё не введена
    if (input.value.includes('.')) {
      event.preventDefault();
      return;
    }
    return;
  }

  // Разрешаем минус, только если он в начале
  if (event.key === '-') {
    const input = event.target as HTMLInputElement;
    if (input.selectionStart !== 0) {
      event.preventDefault();
      return;
    }
    return;
  }

  // Если клавиша не разрешена, отменяем её
  if (!allowedKeys.includes(event.key)) {
    event.preventDefault()
  }
}
