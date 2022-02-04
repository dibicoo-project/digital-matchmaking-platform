import Ajv from "ajv";
import addKeywords from 'ajv-keywords';
import testSchema from './schemas/test.json';

describe('bug', () => {
  it('all strings should be trimmed', () => {
    pending('until fixed');
    const ajv = new Ajv({ allErrors: true });
    addKeywords(ajv, ['transform']);
    const validate = ajv.compile(testSchema);

    const data = {
      a: '   x   ',
      nested: {
        b: '   y   ',
        c: '   z   '
      }
    };

    console.log('Data before validation:', data);
    const res = validate(data);
    console.log('Data after validation:', data);

    expect(res).toBeTrue();
    expect(data.a).toEqual('x');
    expect(data.nested.b).toEqual('y');
    expect(data.nested.c).toEqual('z');
  });
});