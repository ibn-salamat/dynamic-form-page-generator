/* eslint-disable import/prefer-default-export */
import React, { useEffect, useReducer } from 'react';
import { Select, Row, Col } from 'antd';
import { router } from 'umi';
// components
import { Button } from '@/components';
// utils
import request from '@/utils/request';
import testFno from './temporary/testFno.json';

const { Option } = Select;

export function DynamicFormComponent(props) {
  const { formName } = props;

  const [state, setState] = useReducer((prevState, newState) => ({ ...prevState, ...newState }), {
    versions: [],
    currentVersion: null,
  });

  const { versions, currentVersion } = state;

  async function getVersions() {
    if (formName === 'fno_test') {
      // setState({ versions: testFno });

      router.replace({
        pathname: '/account/arm/mgu/monitoring/generated-form',
        query: {
          form: 'fno_test',
          version: 1,
          revision: 1,
          mode: 'add',
        },
        state: testFno,
      });

      return;
    }
    // temporary
    try {
      const res = await request(`/mgu/api/dynamic-form/${formName}/versions`);

      setState({ versions: res });
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getVersions();
  }, []);

  return (
    <>
      <Row gutter={[16, 8]} align="bottom">
        <Col span={6}>
          <p>Форма</p>
          <Select value={formName} disabled style={{ width: '100%' }}>
            <Option value={formName}>{formName}</Option>
          </Select>
        </Col>

        <Col span={6}>
          <p>Версия</p>
          <Select
            style={{ width: '100%' }}
            onChange={value => {
              setState({ currentVersion: versions.find(version => version.number === value) });
            }}
          >
            {versions.map(version => {
              const { name, number } = version;

              return (
                <Option value={number}>
                  {name} {number}
                </Option>
              );
            })}
          </Select>
        </Col>

        <Col span={6}>
          <Button
            disabled={!currentVersion}
            color="success"
            onClick={() => {
              router.replace({
                pathname: '/account/arm/mgu/monitoring/generated-form',
                query: {
                  form: currentVersion?.formType,
                  version: currentVersion?.number,
                  revision: currentVersion?.lastRevision.number,
                  mode: 'add',
                },
                state: currentVersion?.lastRevision,
              });

              // router.go()
            }}
          >
            Создать
          </Button>
        </Col>
      </Row>
    </>
  );
}
