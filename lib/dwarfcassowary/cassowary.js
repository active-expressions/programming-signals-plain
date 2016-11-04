export * from './dwarfcassowary.js';

import { ClSimplexSolver } from './dwarfcassowary.js';

// TODO: duplicate with aexpr-source-transformation-propagation
const compositeKeyStore = new Map();
class CompositeKey {
    static get(obj1, obj2) {
        if(!compositeKeyStore.has(obj1)) {
            compositeKeyStore.set(obj1, new Map());
        }

        let secondKeyMap = compositeKeyStore.get(obj1);

        if(!secondKeyMap.has(obj2)) {
            secondKeyMap.set(obj2, {});
        }

        return secondKeyMap.get(obj2);
    }
    static clear() {
        compositeKeyStore.clear();
    }
}

export class Solver extends ClSimplexSolver {
    constructor() {
        super();
    }


}