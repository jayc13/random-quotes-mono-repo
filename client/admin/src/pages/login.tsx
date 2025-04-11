import {ThemedTitleV2} from "@refinedev/antd";
import {Button, Layout, Space, Typography} from "antd";

import {useAuth0} from "@auth0/auth0-react";

export const Login: React.FC = () => {
  const {loginWithRedirect} = useAuth0();

  return (
    <Layout
      style={{
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Space direction="vertical" align="center">
        <ThemedTitleV2
          collapsed={false}
          wrapperStyles={{
            fontSize: "22px",
            marginBottom: "36px",
          }}
        />
        <Button
          style={{width: "240px", marginBottom: "32px"}}
          type="primary"
          size="middle"
          onClick={() => loginWithRedirect()}
        >
          Sign in
        </Button>
        <Typography.Text type="secondary">
          Powered by
          <img
            style={{padding: "0 5px"}}
            alt="Auth0"
            src="https://refine.ams3.cdn.digitaloceanspaces.com/superplate-auth-icons%2Fauth0-2.svg"
          />
          Auth0
        </Typography.Text>
      </Space>
    </Layout>
  );
};
