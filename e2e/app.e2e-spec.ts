import { BeaconWebPage } from './app.po';

describe('beacon-web App', () => {
  let page: BeaconWebPage;

  beforeEach(() => {
    page = new BeaconWebPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
