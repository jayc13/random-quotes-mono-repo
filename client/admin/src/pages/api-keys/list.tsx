import { DeleteButton, List, useModalForm, useTable } from "@refinedev/antd";
import type { BaseRecord } from "@refinedev/core";
import {
  Button,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Spin,
  Table,
  Typography,
} from "antd";
import React, { useState } from "react";
import { formatDate, formatExpirationDate } from "../../utils/dateHelpers";

export interface IApiKey {
  id: number;
  name: string;
  token: string;
  createdAt: string;
  expiresAt?: string; // Add expiresAt field
}

export const ApiKeyList = () => {
  // Hook for table data management
  const { tableProps } = useTable<IApiKey>({
    resource: "api-tokens", // Specify the resource endpoint
    syncWithLocation: true,
  });

  // State for the newly created API key and triggering the display modal
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [displayKeyModalVisible, setDisplayKeyModalVisible] = useState(false);
  // State to manage the copy button feedback
  const [isCopied, setIsCopied] = useState(false);

  // Hook for the create modal form
  const {
    modalProps: createModalProps,
    formProps: createFormProps,
    show: createModalShow,
    close: createModalClose, // Destructure the close function
    formLoading: createFormLoading,
  } = useModalForm<IApiKey>({
    action: "create", // Still specify action for context, though we handle mutation
    resource: "api-tokens", // Specify the resource endpoint
    redirect: false, // Prevent redirection after creation
    autoResetForm: true, // Reset the form after submission
    warnWhenUnsavedChanges: false,
    onMutationSuccess: async ({ data }) => {
      const apiKey = data?.token;
      if (apiKey) {
        console.log("onFinish: API Key created successfully.");
        setNewApiKey(apiKey);
        setDisplayKeyModalVisible(true); // Trigger the display modal
        createModalClose(); // Close the creation modal
      }
    },
  });

  // Handler function to close the display modal and clear the key
  const handleDisplayModalClose = () => {
    setDisplayKeyModalVisible(false);
    setNewApiKey(null);
    setIsCopied(false); // Reset copied state when modal closes
  };

  // Handler function to copy the API key to the clipboard
  const handleCopyKey = async () => {
    if (newApiKey) {
      try {
        await navigator.clipboard.writeText(newApiKey);
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 1500); // Reset after 1.5 seconds
      } catch (err) {
        console.error("Failed to copy API key to clipboard:", err);
        // Optionally: Show an error message/notification to the user
      }
    }
  };

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
            render={formatDate}
          />
          <Table.Column
            dataIndex='expiresAt' // Add expiresAt column
            title={"Expires At"}
            render={(value: string, apiKey: IApiKey) => {
              if (value) {
                return formatExpirationDate(value);
              }
              // If the 'expiresAt' value is null, default to 90 days from the 'createdAt' date.
              // This ensures that tokens without an explicit expiration date are given a reasonable default lifespan.
              const expiresAtDate = new Date(apiKey.createdAt);
              expiresAtDate.setDate(expiresAtDate.getDate() + 90);
              return formatExpirationDate(expiresAtDate.toISOString());
            }}
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
            <Form.Item
              label='Expiration'
              name='duration'
              initialValue='90 days' // Set default value for the form item
            >
              <Select
                options={[
                  { value: "1 day", label: "1 day" },
                  { value: "1 week", label: "1 week" },
                  { value: "30 days", label: "30 days" },
                  { value: "60 days", label: "60 days" },
                  { value: "90 days", label: "90 days" },
                ]}
              />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>

      {/* Modal to display the newly created API Key */}
      <Modal
        title='API Key Generated'
        open={displayKeyModalVisible}
        onCancel={handleDisplayModalClose} // Use handler for closing via X or ESC
        footer={[
          // Custom footer
          <Button key='close' onClick={handleDisplayModalClose}>
            Close
          </Button>,
          // Update Copy button: add onClick handler and dynamic text
          <Button key='copy' type='primary' onClick={handleCopyKey}>
            {isCopied ? "Copied!" : "Copy Key"}
          </Button>,
        ]}
      >
        <Space direction='vertical' style={{ width: "100%" }}>
          <Typography.Paragraph>
            Please copy your new API key. You won't be able to see it again!
            Store it securely.
          </Typography.Paragraph>
          <Input.TextArea
            readOnly
            value={newApiKey ?? "Generating..."}
            autoSize={{ minRows: 2, maxRows: 5 }} // Adjust size as needed
          />
        </Space>
      </Modal>
    </div>
  );
};
