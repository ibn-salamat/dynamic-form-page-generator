import _ from 'lodash';
// utils
import { checkDateAndMoment } from '@/utils/functions';

export const fieldTypes = {
  LONG: 'LONG',
  INTEGER: 'INTEGER',
  BIG_DECIMAL: 'BIG_DECIMAL',
  STRING: 'STRING',
  BOOLEAN: 'BOOLEAN',
  DATE: 'DATE',
  TIMESTAMP: 'TIMESTAMP',
  FLOAT: 'FLOAT',
};

export function getType(fieldType) {
  let type;

  switch (fieldType) {
    case fieldTypes.BIG_DECIMAL:
    case fieldTypes.INTEGER:
    case fieldTypes.LONG:
    case fieldTypes.FLOAT:
      type = 'number';
      break;
    case fieldTypes.STRING:
      type = 'string';
      break;
    default:
      break;
  }

  return type;
}

export function setMomentDate(data, dateFieldsNames) {
  if (_.isObject(data)) {
    Object.keys(data).forEach(key => {
      if (_.isObject(data[key])) {
        setMomentDate(data[key], dateFieldsNames);
      } else if (typeof data[key] === 'string') {
        if (dateFieldsNames.includes(key)) {
          // eslint-disable-next-line no-param-reassign
          data[key] = checkDateAndMoment(data[key]);
        }
      }
    });
  }
}

export function getAllFields(_fields) {
  const result = [];

  function helper(__fields) {
    __fields.forEach(field => {
      if (field.nestedFields) {
        const { nestedFields } = field;
        // eslint-disable-next-line no-param-reassign
        delete field.nestedFields;
        result.push(field);
        helper(nestedFields);
      } else {
        result.push(field);
      }
    });
  }

  helper(_fields);

  return result;
}
