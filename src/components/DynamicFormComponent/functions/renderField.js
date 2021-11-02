/* eslint-disable import/order */
/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
/* eslint-disable import/prefer-default-export */
import React from 'react';
import { Form, Collapse } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';
import classnames from 'classnames';
// components
// utils
import { renderInput } from '.';
// other
import styles from '@/pages/MGU/Monitoring/FNO/860/index.less';

const { Panel } = Collapse;

const requiredRule = {
  required: true,
  message: formatMessage({ id: 'referenceGroup.mustInput' }),
};

function createFormProps(field) {
  const { nameRus, jsonName, validationConstraints, type } = field;

  const isRequired = validationConstraints.find(el => el.constraintType === 'NOT_NULL');
  const lengthRules = validationConstraints.find(el => el.constraintType === 'SIZE');
  const maxRules = validationConstraints.find(el => el.constraintType === 'MAX');

  const rules = [];

  if (isRequired) rules.push(requiredRule);
  if (lengthRules) {
    const { min, max } = lengthRules.arguments;

    rules.push(
      {
        validator: async (rule, value) => {
          if (String(value).length < min) {
            throw Error(`Минимальная длина символов - ${min}`);
          }
        },
      },
      {
        validator: async (rule, value) => {
          if (String(value).length > max) {
            throw Error(`Максимальная длина символов - ${max}`);
          }
        },
      }
    );
  }

  if (maxRules) {
    const { value: max } = maxRules.arguments;
    rules.push({
      validator: async (rule, value) => {
        if (Number(value) > max) {
          throw Error(`Максимальное значение - ${max}`);
        }
      },
    });
  }

  return {
    rules,
    className: classnames('appFormItemHorizontal', isRequired && styles.inputRequiredRight),
    label: nameRus,
    valuePropName: type === 'BOOLEAN' ? 'checked' : undefined,
    name: jsonName,
  };
}

function renderNestedFields({ field }) {
  const { collection, jsonName, nameRus, nestedFields } = field;
  const formProps = createFormProps(field);

  if (collection) {
    return (
      <div
        style={{
          margin: '5px 0',
        }}
      >
        <Collapse>
          <Panel header={nameRus}>
            <Form.List name={jsonName}>
              {(_fields, { add, remove }) => {
                return (
                  <>
                    {[{ fieldKey: 0, isListField: true, key: 0, name: 0 }, ..._fields].map(
                      _field => {
                        return (
                          <>
                            <Form.List
                              key={_field.name}
                              {..._field}
                              name={[_field.name]}
                              fieldKey={[_field.fieldKey]}
                            >
                              {() => {
                                return (
                                  <>
                                    {nestedFields.map(a => {
                                      if (a.nestedFields.length) {
                                        return renderNestedFields({ field: a });
                                      }

                                      // eslint-disable-next-line no-use-before-define
                                      return renderWithoutNestedFields({ field: a });
                                    })}
                                  </>
                                );
                              }}
                            </Form.List>
                          </>
                        );
                      }
                    )}
                  </>
                );
              }}
            </Form.List>
          </Panel>
        </Collapse>
      </div>
    );
  }
  return (
    <div
      style={{
        margin: '5px 0',
      }}
    >
      <Collapse>
        <Panel header={nameRus}>
          <Form.Item {...formProps} label={null}>
            <Form.List name={jsonName}>
              {() => {
                return (
                  <>
                    {nestedFields.map(a => {
                      if (a.nestedFields.length) {
                        return renderNestedFields({ field: a });
                      }

                      // eslint-disable-next-line no-use-before-define
                      return renderWithoutNestedFields({ field: a });
                    })}
                  </>
                );
              }}
            </Form.List>
          </Form.Item>
        </Panel>
      </Collapse>
    </div>
  );
}

function renderWithoutNestedFields({ field }) {
  const { collection, jsonName } = field;
  const formProps = createFormProps(field);

  if (collection) {
    return (
      <>
        <Form.List name={jsonName}>
          {(_fields, { add, remove }) => {
            return (
              <>
                {[{ fieldKey: 0, isListField: true, key: 0, name: 0 }, ..._fields].map(_field => {
                  return (
                    <>
                      <Form.Item
                        {...formProps}
                        {..._field}
                        name={[_field.name]}
                        fieldKey={[_field.fieldKey]}
                      >
                        {renderInput(field)}
                      </Form.Item>
                    </>
                  );
                })}
              </>
            );
          }}
        </Form.List>
      </>
    );
  }
  return <Form.Item {...formProps}>{renderInput(field)}</Form.Item>;
}

export function renderField(field) {
  const { nestedFields = [] } = field;

  let content = null;

  if (nestedFields.length) {
    content = renderNestedFields({ field });
  } else {
    content = renderWithoutNestedFields({ field });
  }

  return <>{content}</>;
}
