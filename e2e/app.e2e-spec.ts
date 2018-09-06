import { NirvanaTestPage } from './app.po';

describe('nirvana-test App', function() {
  let page: NirvanaTestPage;

  beforeEach(() => {
    page = new NirvanaTestPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
