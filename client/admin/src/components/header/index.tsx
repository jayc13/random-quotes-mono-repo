import type {RefineThemedLayoutV2HeaderProps} from "@refinedev/antd";
import {useGetIdentity, useLogout, useTranslate} from "@refinedev/core";
import {Avatar, Dropdown, Layout as AntdLayout, MenuProps, Space, Switch, theme, Typography,} from "antd";
import React, {useContext} from "react";
import {ColorModeContext} from "../../contexts/color-mode";
import {LogoutOutlined} from "@ant-design/icons";

const {useToken} = theme;

export type IUser = {
  id: number;
  name: string;
  avatar: string;
  roles: string[];
};

export const Header: React.FC<RefineThemedLayoutV2HeaderProps> = ({
                                                                    sticky = true,
                                                                  }) => {
  const {token} = useToken();
  const {data: user} = useGetIdentity<IUser>();
  const {mode, setMode} = useContext(ColorModeContext);
  const translate = useTranslate();
  const {mutate: mutateLogout} = useLogout();

  const items: MenuProps['items'] = [
    {
      label: (
        <div
          key="logout"
          onClick={() => mutateLogout()}
        >
          {translate("buttons.logout", "Logout")}
        </div>
      ),
      icon: <LogoutOutlined/>,
      key: '0',
    }
  ];

  const headerStyles: React.CSSProperties = {
    backgroundColor: token.colorBgElevated,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: "0px 24px",
    height: "64px",
  };

  if (sticky) {
    headerStyles.position = "sticky";
    headerStyles.top = 0;
    headerStyles.zIndex = 1;
  }

  return (
    <AntdLayout.Header style={headerStyles}>
      <Space>
        <Switch
          checkedChildren="🌛"
          unCheckedChildren="🔆"
          onChange={() => setMode(mode === "light" ? "dark" : "light")}
          defaultChecked={mode === "dark"}
        />

        <Dropdown menu={{items}} trigger={['click']} arrow placement="bottomRight">
          <Space style={{marginLeft: "8px", cursor: "pointer"}} size="middle">
            {user?.name && <Typography.Text strong>{user.name}</Typography.Text>}
            {user?.avatar && <Avatar src={user?.avatar} alt={user?.name}/>}
          </Space>
        </Dropdown>
      </Space>
    </AntdLayout.Header>
  );
};
