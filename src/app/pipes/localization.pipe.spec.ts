import { LocalizationPipe } from './localization.pipe';

describe('LocalizationPipe', () => {
  it('create an instance', () => {
    const pipe = new LocalizationPipe(null);
    expect(pipe).toBeTruthy();
  });
});
