'use strict';

//import {reset} from 'aexpr-source-transformation-propagation';

describe('Signal Logic', function() {

    it('one simple dataflow', () => {
        let a = 0;
        signal s = a;

        expect(s).to.equal(0);

        a = 42;

        expect(s).to.equal(42);
        expect(s).to.equal(a);
    });

    it('works transitively', () => {
        let a = 5,
            spy = sinon.spy();

        signal b = a + 2;

        signal c = b + 2;

        expect(b).to.equal(a + 2);
        expect(c).to.equal(b + 2);

        a = 17;

        expect(b).to.equal(a + 2);
        expect(c).to.equal(b + 2);
    });

    xit('prevents glitches', () => {
        let a = 0;
        let counter = 0;
        signal b = a;
        signal c = a + 1;

        function checkConsistency() {
            if(c !== b + 1) {
                throw new Error('subject to the glitch problem! a: ' + a + ', b: ' + b + ', c: ' +c);
            }
        }
        aexpr(() => b).onChange(() => {
            checkConsistency();
            expect(b).to.equal(a);
            counter += 1;
        });

        aexpr(() => c).onChange(() => {
            checkConsistency();
            expect(c).to.equal(a + 1);
            counter += 1;
        });

        a = -10;

        expect(counter).to.equal(2);
    });

    xit('covered cases', () => {
      let obj = {
        prop1: 1,
        func() {
          return this.prop1;
        }
      };
      window.glob = 1;
      function foo(a, b) { return a + glob; }
      let a = 0, b = 1;
      signal s = 1+ a + foo(a,a);
      signal t = s + obj.prop1 + obj.func();
      console.log(['init(2,3) ', s, t])
      
      a = 42;
      console.log(['local(86,87) ', s, t])
      
      obj.prop1 = 17
      console.log(['obj.props(86,117) ', s, t])
      
      glob = 12;
      console.log(['globals(97,131) ', s, t])
      
      a++;
      console.log(['update expr(99,133) ', s, t])
      
      obj.func = function() { return this.prop1 * 2; };
      console.log(['func(99,150) ', s, t])
    })
});
