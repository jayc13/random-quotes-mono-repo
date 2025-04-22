import { useShow, useCustom } from "@refinedev/core";
import { Alert, Card, Layout, Space, Spin, Typography } from "antd";
import type React from "react";
import { useState, useEffect } from "react";

const { Title, Text, Paragraph } = Typography;

export const HomePage: React.FC = () => {
  const [quote, setQuote] = useState<string | null>(null);
  const [author, setAuthor] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useCustom<{ quote: string; author: string }>({
    url: "/random",
    method: "get",
    queryOptions: {
      enabled: false, // Prevent automatic fetching
    },
  });

  // Effect to fetch data on mount
  useEffect(() => {
    refetch();
  }, [refetch]); // Dependency array includes refetch

  // Effect to update state when data is fetched
  useEffect(() => {
    if (data?.data) {
      setQuote(data.data.quote);
      setAuthor(data.data.author);
    }
  }, [data]); // Dependency array includes data

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
      {isLoading ? (
        <Spin />
      ) : isError ? (
        <Alert message='Error fetching quote' type='error' />
      ) : (
        <div>
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
              // Optional: Fallback if quote/author are null/empty after loading
              <Text type='secondary'>Could not load quote.</Text>
            )}
          </Card>
        </div>
      )}
    </Layout>
  );
};
