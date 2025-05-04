import { DeleteButton, List, useModalForm, useTable } from "@refinedev/antd";
import type { BaseRecord } from "@refinedev/core";
import { Form, Input, Modal, Space, Spin, Table } from "antd";
import React from "react";

// Define the interface for API Keys
export interface IApiKey {
  id: number;
  name: string;
  createdAt: string; // Assuming createdAt is a string, adjust if it's a Date object
  // Add other fields as necessary
}

export const ApiKeyList = () => {
  // Hook for table data management
  const { tableProps, tableQueryResult } = useTable<IApiKey>({
    resource: "api-tokens", // Specify the resource endpoint
    syncWithLocation: true,
  });

  // Hook for the create modal form
  const {
    modalProps: createModalProps,
    formProps: createFormProps,
    show: createModalShow,
    formLoading: createFormLoading,
  } = useModalForm<IApiKey>({
    action: "create",
    resource: "api-tokens", // Specify the resource endpoint
    redirect: false, // Prevent redirection after creation
  });

  return (
    <div data-testid='api-keys-page'>
      <List
        createButtonProps={{
          id: "create-api-key-btn",
          onClick: () => {
            createModalShow();
          },
        }}
        title='API Keys'
      >
        <Table {...tableProps} rowKey='id' id='api-keys-table'>
          <Table.Column dataIndex='id' title={"#"} />
          <Table.Column dataIndex='name' title={"Name"} />
          <Table.Column
            dataIndex='createdAt'
            title={"Created At"}
            render={(value) => new Date(value).toLocaleString()}
          />
          <Table.Column
            title={"Actions"}
            dataIndex='actions'
            render={(_, record: BaseRecord) => (
              <Space>
                <DeleteButton
                  hideText
                  size='small'
                  recordItemId={record.id}
                  resource='api-tokens'
                />
              </Space>
            )}
          />
        </Table>
      </List>

      {/* Create API Key Modal */}
      <Modal {...createModalProps} title='Create API Key' width={520}>
        <Spin spinning={createFormLoading}>
          <Form {...createFormProps} layout='vertical'>
            <Form.Item
              label='Name'
              name='name'
              rules={[
                {
                  required: true,
                  message: "Please enter the API Key name",
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
};
