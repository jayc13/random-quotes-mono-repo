import { useCustom } from "@refinedev/core";
import { Alert, Card, Layout, Space, Spin, Typography } from "antd";
import type React from "react";
import { useEffect, useState } from "react";

const { Title, Text, Paragraph } = Typography;

export const HomePage: React.FC = () => {
  const [quote, setQuote] = useState<string | null>(null);
  const [author, setAuthor] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useCustom<{
    quote: string;
    author: string;
  }>({
    url: "/random",
    method: "get",
    queryOptions: {
      enabled: false, // Prevent automatic fetching
    },
  });

  useEffect(() => {
    refetch().then();
  }, [refetch]);

  useEffect(() => {
    if (data?.data) {
      setQuote(data.data.quote);
      setAuthor(data.data.author);
    }
  }, [data]);

  if (isLoading) {
    return (
      <Layout
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "calc(100vh - 64px - 48px)",
          padding: 2,
        }}
        data-testid='home-page'
      >
        <Spin />
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "calc(100vh - 64px - 48px)",
          padding: 2,
        }}
        data-testid='home-page'
      >
        <Alert message='Error fetching quote' type='error' />
      </Layout>
    );
  }

  return (
    <Layout
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "calc(100vh - 64px - 48px)",
        padding: 2,
      }}
      data-testid='home-page'
    >
      <Title level={2} style={{ textAlign: "center", opacity: 0.3 }}>
        Quote of the Moment
      </Title>

      <Card>
        {quote && author ? (
          <Space direction='vertical'>
            <Text italic style={{ fontSize: "1.5rem" }}>
              &quot;{quote}&quot;
            </Text>
            <Text
              type='secondary'
              style={{
                display: "flex",
                justifyContent: "flex-end",
                fontSize: "1.2rem",
              }}
            >
              {author}
            </Text>
          </Space>
        ) : (
          <Text type='secondary'>Could not load quote.</Text>
        )}
      </Card>
    </Layout>
  );
};
