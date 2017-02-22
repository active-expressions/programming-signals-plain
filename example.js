let obj = {
  prop1: 1,
  func() {
    return this.prop1;
  }
};
window.glob = 1;
function foo(a, b) { return a + glob; }
let a = 0, b = 1;
const s = 1+ a + foo(a,a);
const t = s + obj.prop1 + obj.func();
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
