/* eslint-disable import/order */
/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
/* eslint-disable import/prefer-default-export */
import React from 'react';
import { Input, InputNumber, Checkbox, DatePicker, Select } from 'antd';
// components
// utils
import { fieldTypes } from '../utils';

export function renderInput(field, props = {}) {
  const {
    type: inputType,
    enumerationValues,
    enumerationDisplayedValues,
    validationConstraints,
  } = field;
  const lengthRules = validationConstraints.find(el => el.constraintType === 'SIZE');
  const maxRules = validationConstraints.find(el => el.constraintType === 'MAX');

  const lengthProps = {};

  if (lengthRules) {
    const { min, max } = lengthRules.arguments;

    lengthProps.minLength = min;
    lengthProps.maxLength = max;
  }

  if (maxRules) {
    lengthProps.max = maxRules.arguments.value;
  }

  let component = null;

  if (enumerationValues && enumerationDisplayedValues) {
    const optionsValues = Array.from(new Set(enumerationValues));
    const options = optionsValues.map(option => {
      return (
        <Select.Option key={option} value={option}>
          {enumerationDisplayedValues[option]?.rus}
        </Select.Option>
      );
    });

    component = <Select {...props}>{options}</Select>;
    return component;
  }

  switch (inputType) {
    case fieldTypes.LONG:
    case fieldTypes.INTEGER:
    case fieldTypes.BIG_DECIMAL:
    case fieldTypes.FLOAT:
      component = <InputNumber {...lengthProps} style={{ width: '100%' }} {...props} />;
      break;

    case fieldTypes.STRING:
      component = <Input {...lengthProps} {...props} />;
      break;

    case fieldTypes.BOOLEAN:
      component = <Checkbox {...props} />;
      break;
    case fieldTypes.DATE:
      component = <DatePicker {...props} />;
      break;
    case fieldTypes.TIMESTAMP:
      component = <DatePicker {...props} />;
      break;

    default:
      break;
  }

  return component;
}
