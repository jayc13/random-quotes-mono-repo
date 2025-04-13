import {ThemedTitleV2} from "@refinedev/antd";
import {Button, Layout, Space} from "antd";

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
          onClick={() => loginWithRedirect({
            appState: {
              state: {
                from: {
                  pathname: "/",
                },
              },
            }
          })}
        >
          Sign in
        </Button>
      </Space>
    </Layout>
  );
};
