import React from "react";
import { Form, Collapse } from "antd";
import { formatMessage } from "umi-plugin-react/locale";
import classnames from "classnames";
import { uid } from "uid";
// components
// utils
import { renderInput } from "./renderInput";
// other
import styles from "@/pages/MGU/Monitoring/FNO/860/index.less";

const { Panel } = Collapse;

const requiredRule = {
  required: true,
  message: formatMessage({ id: "referenceGroup.mustInput" }),
};

export function renderField(field) {
  const {
    nameRus,
    jsonName,
    validationConstraints,
    type,
    nestedFields = [],
    collection,
  } = field;
  const RenderedInput = renderInput({ ...field });
  const isRequired = validationConstraints.find(
    (el) => el.constraintType === "NOT_NULL"
  );
  const lengthRules = validationConstraints.find(
    (el) => el.constraintType === "SIZE"
  );
  const maxRules = validationConstraints.find(
    (el) => el.constraintType === "MAX"
  );

  const rules = [];
  const style = {
    margin: "5px 0",
  };

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

  let content = null;

  const formProps = {
    rules,
    className: classnames(
      "appFormItemHorizontal",
      isRequired && styles.inputRequiredRight
    ),
    label: nameRus,
    valuePropName: type === "BOOLEAN" ? "checked" : undefined,
    name: jsonName,
  };

  if (nestedFields.length) {
    if (!collection) {
      content = (
        <div style={{ ...style }}>
          <Collapse>
            <Panel header={nameRus}>
              <Form.Item {...formProps} label={null}>
                <Form.List name={jsonName}>
                  {() => {
                    return (
                      <>
                        {nestedFields.map((_field) => {
                          return renderField(_field);
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
    } else {
      content = (
        <div style={{ ...style }}>
          <Collapse>
            <Panel header={nameRus}>
              <Form.Item {...formProps} label={null}>
                <Form.List name={jsonName}>
                  {(_fields, { add, remove }) => {
                    return (
                      <>
                        {[
                          { fieldKey: 0, isListField: true, key: 0, name: 0 },
                          ..._fields,
                        ].map((_field) => {
                          return (
                            <>
                              <Form.List
                                key={uid()}
                                {..._field}
                                name={[_field.name]}
                                fieldKey={[_field.fieldKey]}
                              >
                                {() => {
                                  return (
                                    <>
                                      {nestedFields.map((a) => {
                                        return renderField(a);
                                      })}
                                    </>
                                  );
                                }}
                              </Form.List>
                            </>
                          );
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
  } else {
    // eslint-disable-next-line no-lonely-if
    if (!collection) {
      content = <Form.Item {...formProps}>{RenderedInput}</Form.Item>;
    } else {
      content = (
        <>
          <Form.Item {...formProps}>
            <Form.List name={jsonName}>
              {(_fields, { add, remove }) => {
                return (
                  <>
                    {[
                      { fieldKey: 0, isListField: true, key: 0, name: 0 },
                      ..._fields,
                    ].map((_field) => {
                      return (
                        <>
                          <Form.Item
                            {..._field}
                            name={[_field.name]}
                            fieldKey={[_field.fieldKey]}
                          >
                            {RenderedInput}
                          </Form.Item>
                        </>
                      );
                    })}
                  </>
                );
              }}
            </Form.List>
          </Form.Item>
        </>
      );
    }
  }

  return <>{content}</>;
}
