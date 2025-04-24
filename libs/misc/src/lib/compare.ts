/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-prototype-builtins */
import isEqual from 'lodash.isequal';
import map from 'lodash.map';
import reduce from 'lodash.reduce';

/**
 * 
Object 1:
{
  "same": 1,
  "different": 2,
  "missing_from_b": 3,
  "missing_nested_from_b": {
    "x": 1,
    "y": 2
  },
  "nested": {
    "same": 1,
    "different": 2,
    "missing_from_b": 3
  }
}


Object 2:
{
  "same": 1,
  "different": 99,
  "missing_from_a": 3,
  "missing_nested_from_a": {
    "x": 1,
    "y": 2
  },
  "nested": {
    "same": 1,
    "different": 99,
    "missing_from_a": 3
  }
}

Diff:
{
  different: ['different', 'nested.different'],
  missing_from_first: [
    'nested.missing_from_a',
    'missing_from_a',
    'missing_nested_from_a',
  ],
  missing_from_second: [
    'missing_from_b',
    'missing_nested_from_b',
    'nested.missing_from_b',
  ],
}
 */
export const compare = function (a: any, b: any) {
  const result: {
    different: string[];
    missing_from_first: string[];
    missing_from_second: string[];
  } = {
    different: [],
    missing_from_first: [],
    missing_from_second: [],
  };

  reduce(
    a,
    function (result: any, value, key) {
      if (b.hasOwnProperty(key)) {
        if (isEqual(value, b[key])) {
          return result;
        } else {
          if (typeof a[key] != typeof {} || typeof b[key] != typeof {}) {
            //dead end.
            result.different.push(key);
            return result;
          } else {
            const deeper = compare(a[key], b[key]);
            result.different = result.different.concat(
              map(deeper.different, (sub_path) => {
                return key + '.' + sub_path;
              })
            );

            result.missing_from_second = result.missing_from_second.concat(
              map(deeper.missing_from_second, (sub_path) => {
                return key + '.' + sub_path;
              })
            );

            result.missing_from_first = result.missing_from_first.concat(
              map(deeper.missing_from_first, (sub_path) => {
                return key + '.' + sub_path;
              })
            );
            return result;
          }
        }
      } else {
        result.missing_from_second.push(key);
        return result;
      }
    },
    result
  );

  reduce(
    b,
    function (result: any, value, key) {
      if (a.hasOwnProperty(key)) {
        return result;
      } else {
        result.missing_from_first.push(key);
        return result;
      }
    },
    result
  );

  return result;
};
