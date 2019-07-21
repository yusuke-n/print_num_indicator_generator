import { Dictionary } from 'vue-router/types/router';

export default class CardAsset {
  public filenames: Dictionary<string>;
  public number: number;
  constructor(names?: Dictionary<string>, num?: number) {
    if (names === undefined) {
      this.filenames = { face: '', back: '' };
    } else {
      this.filenames = names;
    }
    if (num === undefined) {
      this.number = 1;
    } else {
      this.number = num;
    }
  }
}
