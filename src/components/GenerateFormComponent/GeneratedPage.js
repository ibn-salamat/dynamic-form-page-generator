/* eslint-disable import/order */
/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
/* eslint-disable import/prefer-default-export */
import React, { useEffect, useState } from "react";
import { Card, Form, notification } from "antd";
import { connect } from "dva";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { router } from "umi";
import _ from "lodash";
// components
import JournalHeader from "@/components/JournalHeader";
import { SubmitButtons } from "@/pages/MGU/components";
// utils
import request from "@/utils/request";
import { setMomentDate, getAllFields, fieldTypes } from "./utils";
import { renderField } from "./renderField";

// other
import Button from "@/components/Button";

function GeneratedPage(props) {
  const [form] = Form.useForm();
  const [isDocumentGot, setIsDocumentGot] = useState(false);

  const {
    location: { state: pageData },
    history,
    dispatch,
    responseGetDoc,
  } = props;

  const {
    docId,
    mode = "add",
    form: typeForm,
    version: formVersion,
    revision: formRevision,
  } = history.location.query;

  const [formData, setFormData] = useState({
    isExist: null,
    fields: [],
    applications: [],
    fieldSets: [],
    title: "Неизвестные данные",
  });

  const { title, fieldSets } = formData;

  async function getDocument() {
    const {
      document: { request: _request = {} },
    } = responseGetDoc;

    const fields = fieldSets.map((fieldSet) => fieldSet.fields).flat();

    const allFields = getAllFields(_.cloneDeep(fields));
    const dateFields = allFields.filter(
      (field) =>
        field.type === fieldTypes.DATE || field.type === fieldTypes.TIMESTAMP
    );
    const dateDieldsNames = dateFields.map((field) => field.jsonName);

    setMomentDate(_request, dateDieldsNames);
    form.setFieldsValue({ ..._request });
  }

  async function getFormData() {
    // needs refactor

    // temporary
    try {
      const currentVersion = await request(
        `/mgu/api/dynamic-form/${typeForm}/versions/${formVersion}/revisions/${formRevision}`
      );

      if (!currentVersion) {
        return;
      }

      setFormData({
        ...currentVersion,
        fieldSets: currentVersion?.fieldSets,
        isExist: true,
        title: currentVersion?.description,
      });
    } catch (error) {
      console.log(error);
    }
  }

  // useEffects
  useEffect(() => {
    if (mode === "view" || mode === "edit") {
      dispatch({
        type: "mgu_requests/setState",
        payload: {
          docId,
          mode,
        },
      });

      dispatch({
        type: "mgu_requests/getDoc",
        payload: {
          module: "mgu",
        },
      });
    }
    return () => {
      dispatch({
        type: "mgu_requests/setState",
        payload: {
          docId: null,
          mode: "add",
          responseGetDoc: null,
        },
      });
    };
  }, []);

  useEffect(() => {
    if (
      mode !== "add" &&
      responseGetDoc &&
      formData.isExist &&
      !isDocumentGot
    ) {
      setIsDocumentGot(true);
      getDocument();
    }
  }, [responseGetDoc]);

  useEffect(() => {
    if (pageData?.fieldSets.length > 0) {
      setFormData({
        ...pageData,
        fieldSets: pageData?.fieldSets,
        isExist: true,
        title: pageData?.description,
      });
    } else {
      getFormData();
    }
  }, []);

  return (
    <>
      <JournalHeader
        title={title}
        backBtnPath="/account/arm/mgu/monitoring"
        backBtn
      />

      <Card style={{ padding: 10 }} className="changedDisable">
        {!formData.isExist && (
          <>
            <Button
              type="default"
              onClick={() => {
                router.push("/account/arm/mgu/monitoring");
              }}
            >
              <ArrowLeftOutlined />
              Вернуться назад
            </Button>
          </>
        )}
        {formData.isExist && (
          <>
            <Form name="generatedForm" form={form} layout="vertical">
              {(typeForm === "fno_101_01" ||
                typeForm === "fno_911" ||
                typeForm === "fno_421" ||
                typeForm === "fno_700" ||
                typeForm === "fno_870" ||
                typeForm === "fno_250" ||
                typeForm === "fno_860" ||
                typeForm === "individual_income_tax_220") && (
                <>
                  {fieldSets.map((fieldSet) => {
                    const { name, fields: _fields } = fieldSet;

                    return (
                      <fieldset>
                        <legend>{name}</legend>
                        {_fields?.map((field) => {
                          return renderField(field);
                        })}
                      </fieldset>
                    );
                  })}
                </>
              )}
            </Form>

            <SubmitButtons
              handleSave={() => {
                const values = form.getFieldsValue();

                const forRequest = {
                  typeForm,
                  ...values,
                  revision: formRevision,
                  version: formVersion,
                };

                return forRequest;
              }}
              handleClear={() => {
                form.resetFields();
              }}
              handleCheck={async () => {
                try {
                  await form.validateFields();
                  notification.success({ message: "Проверка пройдена" });
                } catch (error) {
                  if (error.errorFields.length) {
                    notification.error({ message: "Заполните все поля" });
                    return;
                  }
                  notification.success({ message: "Проверка пройдена" });
                }
              }}
              handleProcess={async () => {
                await form.validateFields();
              }}
              module="mgu"
            />
          </>
        )}
      </Card>
    </>
  );
}

export default connect(({ mgu_requests: requests }) => {
  const { docId, mode, responseGetDoc } = requests;
  return {
    docId,
    mode,
    responseGetDoc,
  };
})(GeneratedPage);
