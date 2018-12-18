import assert from 'assert';
import {parseCode} from '../src/js/code-analyzer';

describe('The javascript parser', () => {
    it('check if, else if and else conditions', () => {
        assert.equal(parseCode('function foo(x, y, z){\n    let a = x + 1;\n    let b = a + y;\n' +
              '    let c = 0;\n    \n    if (b < z) {\n        c = c + 5;\n' +
              '        return x + y + z + c;\n    } else if (b < z * 2) {\n' +
              '        c = c + x + 5;\n        return x + y + z + c;\n' +
              '    } else {\n        c = c + z + 5;\n        return x + y + z + c;\n' +
              '    }\n}\n', '1,2,3')[0],
        'function foo(x, y, z){\n' +
          '\tif(x + y  + 1 < z){\n' +
          '\t\treturn x + y + z   + 5;\t}\n' +
          '\telse if(x + y  + 1 < z * 2){\n' +
          '\t\treturn x + y + z   + x  + 5;\t}\n' +
          '\telse{\n' +
          '\t\treturn x + y + z   + z  + 5;\t}\n' +
          '}'
        );
    });
});
describe('The javascript parser', () => {
    it('check multiplying operator', () => {
        assert.equal(parseCode('function foo(x, y, z){\n' +
          'let a = x - 1;\n' +
          'let b = a / y;\n' +
          '\n' +
          '    if (z) {\n' +
          '       z = a * 5;\n' +
          '       return x + y + z + c;\n' +
          '    }\n' +
          '    return y;\n' +
          '}', '4,2,3')[0],
        'function foo(x, y, z){\n' +
          '\tif(z){\n' +
          '\t\tz = (x - 1) * 5;\t\treturn x + y + z   + c;\t}\n' +
          '\treturn y;}'
        );
    });
});

describe('The javascript parser', () => {
    it('check division operator', () => {
        assert.equal(parseCode('function foo(x, y, z){\n' +
      '    let a = x - 1;\n' +
      '    let b = a / y;\n' +
      '    \n' +
      '    if (b < z) {\n' +
      '        z = a / 5;\n' +
      '        return x + y + z + c;\n' +
      '    }\n' +
      '    return y;\n' +
      '}', '4,2,3')[0],
        'function foo(x, y, z){\n' +
      '\tif((x - 1) / y < z){\n' +
      '\t\tz = (x - 1) / 5;\t\treturn x + y + z   + c;\t}\n' +
      '\treturn y;}'
        );
    });
});

describe('The javascript parser', () => {
    it('check subtraction operator', () => {
        assert.equal(parseCode('function foo(x, y, z){\n' +
          '  let b = 8;\n' +
          'let a = x +1;\n' +
          '    if (b < z) {\n' +
          '        z = a - 5;\n' +
          '        return x + y + z + c;\n' +
          '    }\n' +
          '    return y;\n' +
          '}', '5,2,3')[0],
        'function foo(x, y, z){\n' +
          '\tif(8 < z){\n' +
          '\t\tz = x -4;\t\treturn x + y + z   + c;\t}\n' +
          '\treturn y;}'
        );
    });
});





describe('The javascript parser', () => {
    it('check more operators', () => {
        assert.equal(parseCode('function foo(x, y, z){\n' +
          '    let a = 6*3;\n' +
          '    let b = 10/5;\n' +
          '    let c = 10 - 8;\n' +
          '}', '5,2,3')[0],
        'function foo(x, y, z){\n' +
          '}'
        );
    });
});

describe('The javascript parser', () => {
    it('check array as input argument', () => {
        assert.equal(parseCode('function foo(x, y){\n' +
          '              let a = x[0] + 1;\n' +
          '              let b = x[1] + y;\n' +
          '              let c = 0;\n' +
          '              \n' +
          '              if (a < b) {\n' +
          '                  c = a + b;\n' +
          '                  return y;\n' +
          '            }\n' +
          '              \n' +
          '              return x;\n' +
          '          }', '[2,4,8],3')[0],
        'function foo(x, y){\n' +
          '\tif(x[0] + 1 < x[1] + y){\n' +
          '\t\treturn y;\t}\n' +
          '\treturn x;}'
        );
    });});

describe('The javascript parser', () => {
    it('check boolean as an argument', () => {
        assert.equal(parseCode('function foo(x){\n' +
      '    \n' +
      '    if (x) {\n' +
      '        return 5;\n' +
      '  }\n' +
      '    \n' +
      '    return 7;\n' +
      '}', 'false')[0],
        'function foo(){\n' +
      '\tif(x){\n' +
      '\t\treturn 5;\t}\n' +
      '\treturn 7;}'
        );
    });
});
describe('The javascript parser', () => {
    it('check globals', () => {
        assert.equal(parseCode('let k = 5;\n' +
          'let m;\n' +
          'function foo(x,y){\n' +
          '     if(x+k>y){\n' +
          '          return 5;\n' +
          '     }\n' +
          '     return 6;\n' +
          '}\n' +
          'let p = 7;\n' +
          'p = 5;', '1,7')[0],
        'function foo(x, y){\n' +
          '\tif(x + k > y){\n' +
          '\t\treturn 5;\t}\n' +
          '\treturn 6;}'
        );
    });
});
describe('The javascript parser', () => {
    it('check else if with single predicate', () => {
        assert.equal(parseCode('function foo(x){\n' +
          '    if(x){\n' +
          '         return 5;\n' +
          '    }\n' +
          '    else if(!x){\n' +
          '        return 6;\n' +
          '    }\n' +
          '}', 'true')[0],
        'function foo(){\n' +
          '\tif(x){\n' +
          '\t\treturn 5;\t}\n' +
          '\telse if(!x){\n' +
          '\t\treturn 6;\t}\n' +
          '}'
        );
    });
});



describe('The javascript parser', () => {
    it('check assignment to array', () => {
        assert.equal(parseCode('function foo(x){\n' +
          '     if(x[0]>=x[1]){\n' +
          '         x[0]=5;\n' +
          '     }\n' +
          '}', '[1,2]')[0],
        'function foo(){\n' +
          '\tif(x[0] >= x[1]){\n' +
          '\t\tx[0] = 5;\t}\n' +
          '}'
        );
    });
});

describe('The javascript parser', () => {
    it('check multiplying', () => {
        assert.equal(parseCode('function foo(x, y, z){\n' +
      '    let a = x * 1;\n' +
      '    let b = a + y;\n' +
      '    let c = 0;\n' +
      '    \n' +
      '    while (a < z) {\n' +
      '        c = a + b;\n' +
      '        z = c * 2;\n' +
      '    }\n' +
      '    \n' +
      '    return z;\n' +
      '}', '[1,2,3]')[0],
        'function foo(x, y, z){\n' +
      '\twhile(x * 1 < z){\n' +
      '\t\tz = (x + x + y  + 2) * 2;\t}\n' +
      '\treturn z;}'    );
    });
});
describe('The javascript parser', () => {
    it('check while with single predicate', () => {
        assert.equal(parseCode('function foo(x, y, z){\n' +
      '    while(x){\n' +
      '\n' +
      '    }\n' +
      '}', 'true')[0],
        'function foo(x, y, z){\n' +
      '\twhile(x){\n' +
      '\t}\n' +
      '}'    );
    });
});
describe('The javascript parser', () => {
    it('check nested conditions', () => {
        assert.equal(parseCode('function foo(x, y, z){\n' +
      '    let a = x + 1;\n' +
      '    let b = a + y;\n' +
      '    let c = 0;\n' +
      '    \n' +
      '    if (b < z) {\n' +
      '        c = c + 5;\n' +
      '        return x + y + z + c;\n' +
      '\t\tif(x>y){\n\t\t\treturn z;\n' +
      '\t\t}\n\t} \n}', '2,3,1')[0],
        'function foo(x, y, z){\n' +
      '\tif(x + y  + 1 < z){\n' +
      '\t\treturn x + y + z   + 5;\t\tif(x > y){\n' +
      '\t\t\treturn z;\t\t}\n' +
      '\t}\n' +
      '}'    );
    });
});

describe('The javascript parser', () => {
    it('check nested conditions', () => {
        assert.equal(parseCode('function foo(x, y, z){\n' +
      '    let b = 5;\n' +
      '    if (b < z) {\n' +
      '        c = c + 5;\n' +
      '        return x + y + z + c;\n' +
      '\t\tif(x>y){\n' +
      '\t\t\treturn z;\n' +
      '\t\t}\n' +
      '                else if(x){\n                        return 5;\n                }\n' +
      '                else{\n                        return 6;\n' +
      '                }\n\t} \n}', '2,3,1')[0],
        'function foo(x, y, z){\n' +
      '\tif(5 < z){\n\t\treturn x + y + z   + c + 5;\t\tif(x > y){\n' +
      '\t\t\treturn z;\t\t}\n\t\telse if(x){\n' +
      '\t\t\treturn 5;\t\t}\n\t\telse{\n\t\t\treturn 6;\t\t}\n\t}\n' +
      '}');
    });
});
describe('The javascript parser', () => {
    it('check assignment of local variable', () => {
        assert.equal(parseCode('function foo(x,y){\n' +
          '    let a = x + 1;\n' +
          '    a = y;\n' +
          '    if(x+a>a){\n' +
          '         return 5;\n' +
          '    }\n' +
          '    return 6;\n' +
          '}', '2,1,8')[0],
        'function foo(x, y){\n' +
          '\tif(x + y > y){\n' +
          '\t\treturn 5;\t}\n' +
          '\treturn 6;}');
    });
});
describe('More array testing', () => {
    it('check array as global variable', () => {
        assert.equal(parseCode('let w = [2,1,5];\nlet p;\nfunction foo(x, y, z){\n' +
          '     let b = 2;\n      p = 9;   \n     let c = w[0];\n' +
          '  w[0] = 2; \n     if (b < w[0]){ \n' +
          '                  c = w[2] + 5;         return x + y + z + c;\n' +
          '               } else if (b < z * 2) {                 c = c + x + 5;       \n' +
          '                   return x + y + z + c;    } else {        \n' +
          '                   c = c + z + 5;      return x + y + z + c;\n' +
          '               }}', '1,2,3')[0],
        'function foo(x, y, z){\n' +
          '\tp = 9;\tw[0] = 2;\tif(2 < w[0]){\n' +
          '\t\treturn x + y + z   + 10;\t}\n' +
          '\telse if(2 < z * 2){\n' +
          '\t\treturn x + y + z   + x  + 7;\t}\n' +
          '\telse{\n' +
          '\t\treturn x + y + z   + z  + 7;\t}\n' +
          '}');
    });
});
describe('More array testing', () => {
    it('check array as global variable', () => {
        assert.equal(parseCode('let w = [2,1,5];\n' +
          'w[2] = 3;\n' +
          'function foo(x){\n' +
          '     w[1]=5;\n' +
          '     return w[2];\n' +
          '}', '1')[0],
        'w[2] = 3;function foo(){\n' +
          '\tw[1] = 5;\treturn 3;}');
    });
});

describe('simple cases', () => {
    it('check assignment without dec', () => {
        assert.equal(parseCode('function foo(x, y, z){   \n' +
      '    a = x;\n' +
      '}', '1,2,3')[0],
        'function foo(x, y, z){\n' +
      '}');
    });
});

describe('simple cases', () => {
    it('check local array assignment', () => {
        assert.equal(parseCode('function foo(x, y, z){    \n' +
          '        let w = [1,2];\n' +
          '        w[1] = 5;\n' +
          '         let b = w[0];\n' +
          '         return w[1];\n' +
          '      }', '1,2,3')[0],
        'function foo(x, y, z){\n' +
          '\treturn 5;}');
    });
});
