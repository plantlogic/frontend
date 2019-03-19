import { UnderscoreToSpace } from './underscore-to-space';

describe('UnderscoreToSpace', () => {
  it('create an instance', () => {
    const pipe = new UnderscoreToSpace();
    expect(pipe).toBeTruthy();
  });
});
