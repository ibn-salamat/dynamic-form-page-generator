import React from 'react';
import { renderField } from './functions';

// eslint-disable-next-line import/prefer-default-export
export function GeneratedInputs({ fieldSets }) {
  return (
    <>
      {fieldSets?.map(fieldSet => {
        const { name, fields } = fieldSet;

        return (
          <fieldset>
            <legend>{name}</legend>
            {fields?.map(field => {
              return renderField(field);
            })}
          </fieldset>
        );
      })}
    </>
  );
}
