import { useShow } from "@refinedev/core";
import { Alert, Card, Layout, Space, Spin, Typography } from "antd";
import type React from "react";

const { Title, Text, Paragraph } = Typography;

export const HomePage: React.FC = () => {
  const { queryResult } = useShow({
    resource: "quotes",
    id: 1,
  });

  const { data, isLoading, isError, error } = queryResult;

  if (isLoading) {
    return (
      <Layout
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin />
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout style={{ padding: 2 }}>
        <Alert
          type='error'
          message={`Error fetching quote: ${error?.message || "An unknown error occurred"}`}
        />
      </Layout>
    );
  }

  const record = data?.data;

  return (
    <Layout
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "calc(100vh - 64px - 48px)",
        padding: 2,
      }}
    >
      <div>
        <Title level={2} style={{ textAlign: "center", opacity: 0.3 }}>
          Quote of the Moment
        </Title>

        <Card>
          <Space direction='vertical'>
            <Text italic style={{ fontSize: "1.5rem" }}>
              &quot;{record?.quote} &quot;
            </Text>
            <Text
              type='secondary'
              style={{
                display: "flex",
                justifyContent: "flex-end",
                fontSize: "1.2rem",
              }}
            >
              {record?.author}
            </Text>
          </Space>
        </Card>
      </div>
    </Layout>
  );
};
