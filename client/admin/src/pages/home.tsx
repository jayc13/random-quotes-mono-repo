import { useShow } from "@refinedev/core";
import { Alert, Card, Layout, Space, Spin, Typography } from "antd";
import type React from "react";

const { Title, Text, Paragraph } = Typography;

export const HomePage: React.FC = () => {

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
      <div>
        <Title level={2} style={{ textAlign: "center", opacity: 0.3 }}>
          Quote of the Moment
        </Title>

        <Card>
          <Space direction='vertical'>
            <Text italic style={{ fontSize: "1.5rem" }}>
              &quot;Happiness is not something ready-made. It comes from your own actions.&quot;
            </Text>
            <Text
              type='secondary'
              style={{
                display: "flex",
                justifyContent: "flex-end",
                fontSize: "1.2rem",
              }}
            >Dalai Lama XIV</Text>
          </Space>
        </Card>
      </div>
    </Layout>
  );
};
