import { describe, expect, it } from 'vitest';
import { plainText, questionTitle, splitQuestion } from '@/lib/text';

describe('plainText', () => {
  it('keeps code span content verbatim and drops emphasis outside code', () => {
    expect(plainText('What are `*args` and `**kwargs`?')).toBe('What are *args and **kwargs?');
    expect(plainText('What is `__init__` vs **`__new__`**?')).toBe('What is __init__ vs __new__?');
    expect(plainText('A *really* **important** point')).toBe('A really important point');
  });
});

describe('questionTitle', () => {
  it('uses only the first paragraph of a question with code', () => {
    const q = 'What does this print?\n\n```python\nprint(1)\n```';
    expect(splitQuestion(q)).toEqual({
      title: 'What does this print?',
      body: '```python\nprint(1)\n```',
    });
    expect(questionTitle(q)).toBe('What does this print?');
  });
});
