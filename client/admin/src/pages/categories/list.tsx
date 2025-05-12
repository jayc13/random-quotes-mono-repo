import {
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useModalForm,
  useTable,
} from "@refinedev/antd";
import { type BaseRecord, useShow } from "@refinedev/core";
import { Form, Input, Modal, Space, Spin, Table, Typography } from "antd";
import { useState } from "react";

const { Title, Text } = Typography;

export interface ICategory {
  id: number;
  name: string;
}

const modalFormStyles = {
  wrap: {
    maxWidth: "600px",
    width: "100%",
    margin: "0 auto",
  },
  content: {
    padding: 0,
    maxWidth: "600px",
    width: "100%",
    margin: "0 auto",
  },
  header: {
    margin: 0,
    minHeight: "60px",
    display: "flex",
    alignItems: "center",
    padding: "8px 16px",
  },
  body: {
    padding: "16px",
    margin: 0,
    borderTop: "1px solid #f0f0f0",
    borderBottom: "1px solid #f0f0f0",
  },
  footer: {
    padding: "8px 16px",
  },
};

const modalShowStyles = {
  header: {
    margin: 0,
    minHeight: "60px",
    display: "flex",
    alignItems: "center",
    padding: "8px 16px",
  },
  body: {
    padding: "16px",
    borderTop: "1px solid #f0f0f0",
  },
  footer: {
    padding: 0,
  },
  content: {
    padding: 0,
    maxWidth: "600px",
    margin: "0 auto",
  },
};

export const CategoryList = () => {
  const { tableProps } = useTable<ICategory>({
    syncWithLocation: true,
  });
  // Create Modal
  const {
    modalProps: createModalProps,
    formProps: createFormProps,
    show: createModalShow,
    formLoading: createFormLoading,
  } = useModalForm<ICategory>({
    action: "create",
    syncWithLocation: true,
    warnWhenUnsavedChanges: true,
  });

  // Edit Modal
  const {
    modalProps: editModalProps,
    formProps: editFormProps,
    show: editModalShow,
    formLoading: editFormLoading,
  } = useModalForm<ICategory>({
    action: "edit",
    syncWithLocation: true,
    warnWhenUnsavedChanges: true,
  });

  // Show Modal
  const [visibleShowModal, setVisibleShowModal] = useState<boolean>(false);

  const { query: queryResult } = useShow<ICategory>();

  const { data: showQueryResult } = queryResult;
  const record = showQueryResult?.data;

  return (
    <div data-testid='categories-page'>
      <List
        createButtonProps={{
          id: "add-category-btn",
          onClick: () => {
            createModalShow();
          },
        }}
        title='Categories'
      >
        <Table {...tableProps} rowKey='id' id='categories-table'>
          <Table.Column dataIndex='id' title={"#"} />
          <Table.Column dataIndex='name' title={"Name"} />
          <Table.Column
            title={"Actions"}
            width={100}
            dataIndex='actions'
            render={(_, record: BaseRecord) => (
              <Space>
                <EditButton
                  hideText
                  size='small'
                  data-testid={`edit-category-${record.id}`}
                  recordItemId={record.id}
                  onClick={() => editModalShow(record.id)}
                />
                <ShowButton
                  hideText
                  size='small'
                  recordItemId={record.id}
                  data-testid={`show-category-${record.id}`}
                />
                <DeleteButton
                  hideText
                  size='small'
                  recordItemId={record.id}
                  data-testid={`delete-category-${record.id}`}
                />
              </Space>
            )}
          />
        </Table>
      </List>
      <Modal
        {...createModalProps}
        styles={modalFormStyles}
        data-testid='create-category-modal'
      >
        <Spin spinning={createFormLoading}>
          <Form {...createFormProps} layout='vertical'>
            <Form.Item
              label='Name'
              name='name'
              data-testid='categoryName'
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
      <Modal
        {...editModalProps}
        styles={modalFormStyles}
        data-testid='edit-category-modal'
      >
        <Spin spinning={editFormLoading}>
          <Form {...editFormProps} layout='vertical'>
            <Form.Item
              label='Name'
              name='name'
              data-testid='categoryName'
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
      <Modal
        open={visibleShowModal}
        footer={false}
        onCancel={() => setVisibleShowModal(false)}
        title='Category Details'
        styles={modalShowStyles}
      >
        <Title level={5}>Id</Title>
        <Text>{record?.id}</Text>
        <Title level={5}>Name</Title>
        <Text>{record?.name}</Text>
      </Modal>
    </div>
  );
};
