'use strict';

//import {reset} from 'aexpr-source-transformation-propagation';

describe('Signal Logic', function() {

    it('one simple dataflow', () => {
        let a = 0;
        const s = a;

        expect(s).to.equal(0);

        a = 42;

        expect(s).to.equal(42);
        expect(s).to.equal(a);
    });

    it('works transitively', () => {
        let a = 5,
            spy = sinon.spy();

        const b = a + 2;

        const c = b + 2;

        expect(b).to.equal(a + 2);
        expect(c).to.equal(b + 2);

        a = 17;

        expect(b).to.equal(a + 2);
        expect(c).to.equal(b + 2);
    });

    xit('shows the glitch problem', () => {
        let a = 0;
        const b = a;
        const c = a + 1;

        function checkConsistency() {
            if(c !== b + 1) {
                throw new Error('subject to the glitch problem! a: ' + a + ', b: ' + b + ', c: ' +c);
            }
        }

        aexpr(() => b).onChange(checkConsistency);
        aexpr(() => c).onChange(checkConsistency);

        a = -10;
    });
});
