/** Icons added while moving the dynamic form builder onto <app-icon>. Same format as BASE_ICONS in icons.ts. */
export const EXTRA_ICONS_BUILDER = {
  'chevron-up': ['M5 15l7-7 7 7'],
  'plus-small': ['M12 6v6m0 0v6m0-6h6m-6 0H6'],
  paperclip: [
    'M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13'
  ],
  file: [
    'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z'
  ]
} as const satisfies Record<string, readonly string[]>;
