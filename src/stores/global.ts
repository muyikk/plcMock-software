import { defineStore } from 'pinia';

interface GlobalState {
  globalVar: string;
  isStart: boolean;
}

export const useGlobalStore = defineStore('global', {
  state: (): GlobalState => ({
    globalVar: 'Hello, Pinia!',
    isStart: false,
  }),
  getters: {
    uppercaseVar: (state) => state.globalVar.toUpperCase(),
  },
  actions: {
    setGlobalVar(newVal: string) {
      this.globalVar = newVal;
    },
  },
});
