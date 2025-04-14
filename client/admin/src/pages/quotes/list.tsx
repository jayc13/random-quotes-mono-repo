import {DeleteButton, EditButton, List, ShowButton, useModalForm, useTable,} from "@refinedev/antd";
import {type BaseRecord, HttpError, useList, useSelect, useShow} from "@refinedev/core";
import {Card, Form, Input, Modal, Select, Space, Spin, Table, Tag, Typography} from "antd";
import {ICategory} from '../categories'
import {useState} from "react";

const {Title, Text, Paragraph} = Typography;


interface IQuote {
  id: number;
  quote: string;
  author: string;
  categoryId: number;
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
    minHeight: '60px',
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px'
  },
  body: {
    padding: "16px",
    margin: 0,
    borderTop: "1px solid #f0f0f0",
    borderBottom: "1px solid #f0f0f0",
  },
  footer: {
    padding: '8px 16px'
  },
};

const modalShowStyles = {
  header: {
    margin: 0,
    minHeight: '60px',
    padding: '8px 16px',
    display: 'flex',
    alignItems: 'center',
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

export interface QuoteListProps {
  categoryId?: number;
}

export const QuoteList = ({categoryId}: QuoteListProps) => {
  const {tableProps} = useTable<IQuote>({
    syncWithLocation: true,
    resource: "quotes",
    filters: {
      mode: "server",
      permanent: [
        {
          field: "categoryId",
          operator: "equal",
          value: categoryId,
        },
      ],
    },

  });
  // Create Modal
  const {
    modalProps: createModalProps,
    formProps: createFormProps,
    show: createModalShow,
    formLoading: createFormLoading,
  } = useModalForm<IQuote>({
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
  } = useModalForm<IQuote>({
    action: "edit",
    syncWithLocation: true,
    warnWhenUnsavedChanges: true,
  });

  // Show Modal
  const [visibleShowModal, setVisibleShowModal] = useState<boolean>(false);

  const {query: queryResult, setShowId} = useShow<IQuote>();

  const useSelectCategories = useSelect<ICategory>({
    resource: "categories",
    optionLabel: "name",
    optionValue: "id",
  });

  const {
    data: dataCategories,
    isLoading: isLoadingCategories,
  } = useList<ICategory, HttpError>({
    resource: "categories"
  });

  const {data: showQueryResult} = queryResult;
  const record = showQueryResult?.data;

  return (
    <>
      <List
        createButtonProps={{
          onClick: () => {
            createModalShow();
          },
        }}
        title="Quotes"
      >
        <Table {...tableProps} rowKey="id">
          <Table.Column dataIndex="id" title={"#"}/>
          <Table.Column
            dataIndex="quote"
            title={"Quote"}
            render={(value) => (
              <Text italic>  &quot;{value}  &quot;</Text>
            )}
          />
          <Table.Column dataIndex="author" title={"Author"}/>
          <Table.Column
            dataIndex={["categoryId"]}
            title="Category"
            render={(value) => {
              if (isLoadingCategories) return "loading...";
              const label = dataCategories?.data?.find((p: ICategory) => p.id === value)?.name;
              return <Tag>{label}</Tag>
            }}
          />
          <Table.Column
            title={"Actions"}
            width={100}
            dataIndex="actions"
            render={(_, record: BaseRecord) => (
              <Space>
                <EditButton
                  hideText
                  size="small"
                  recordItemId={record.id}
                  onClick={() => editModalShow(record.id)}
                />
                <ShowButton
                  hideText
                  size="small"
                  recordItemId={record.id}
                  onClick={() => {
                    setShowId(record.id);
                    setVisibleShowModal(true);
                  }}
                />
                <DeleteButton
                  hideText
                  size="small"
                  recordItemId={record.id}
                />
              </Space>
            )}
          />
        </Table>
      </List>
      <Modal {...createModalProps} styles={modalFormStyles}>
        <Spin spinning={createFormLoading}>
          <Form {...createFormProps} layout="vertical">
            <Form.Item
              label="Quote"
              name="quote"
              rules={[{required: true}]}
            >
              <Input.TextArea rows={3} maxLength={250} style={{resize: 'none'}}/>
            </Form.Item>
            <Form.Item
              label="Author"
              name="author"
              rules={[{required: true}]}
            >
              <Input maxLength={100}/>
            </Form.Item>
            <Form.Item
              label="Category"
              name="categoryId"
              rules={[{required: true}]}
            >
              <Select
                placeholder="Select a category"
                {...useSelectCategories}
              />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
      <Modal {...editModalProps} styles={modalFormStyles}>
        <Spin spinning={editFormLoading}>
          <Form {...editFormProps} layout="vertical">
            <Form.Item
              label="Quote"
              name="quote"
              rules={[{required: true}]}
            >
              <Input.TextArea rows={3} maxLength={250} style={{resize: 'none'}}/>
            </Form.Item>
            <Form.Item
              label="Author"
              name="author"
              rules={[{required: true}]}
            >
              <Input maxLength={100}/>
            </Form.Item>
            <Form.Item
              label="Category"
              name="categoryId"
              rules={[{required: true}]}
            >
              <Select
                placeholder="Select a category"
                {...useSelectCategories}
              />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
      <Modal
        open={visibleShowModal}
        footer={false}
        onCancel={() => setVisibleShowModal(false)}
        title={<div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
          <Title level={5} style={{margin: 0, padding: 0}}>Quote</Title>
          <Tag color="blue-inverse" style={{marginLeft: '8px'}}>
            {dataCategories?.data?.find((p: ICategory) => p.id === record?.categoryId)?.name}
          </Tag>
        </div>}
        styles={modalShowStyles}
      >
        <Card>
          <Space direction="vertical">
            <Text italic>  &quot;{record?.quote}  &quot;</Text>
            <Text type="secondary">{record?.author}</Text>
          </Space>
        </Card>
      </Modal>
    </>
  );
};
