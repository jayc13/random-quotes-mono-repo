import { useAuth0 } from "@auth0/auth0-react";
import { useCustomMutation, useNotification } from "@refinedev/core";
import {
  Button,
  Card,
  Divider,
  Form,
  Input,
  Modal,
  Space,
  Spin,
  Typography,
} from "antd";
import React, { useState } from "react";
import { API_URL, AUTH0_CLIENT_ID, AUTH0_DOMAIN } from "../../utils/constants";

const { Title, Text } = Typography;

export const ProfilePage: React.FC = () => {
  const { user, isLoading, getAccessTokenSilently, logout } = useAuth0();
  const { open } = useNotification();
  const [form] = Form.useForm();

  const [isNameUpdating, setIsNameUpdating] = useState(false);
  const [isPasswordTicketSending, setIsPasswordTicketSending] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const allowChangeName = !user?.sub?.includes("google-oauth2");
  const allowResetPassword = !user?.sub?.includes("google-oauth2");

  const { mutateAsync } = useCustomMutation({
    mutationOptions: {
      useErrorBoundary: false,
    },
  });

  const handleChangeName = async (values: { name: string }) => {
    setIsNameUpdating(true);

    try {
      await mutateAsync({
        url: `${API_URL}/users/me/name`,
        method: "patch",
        values: {
          name: values.name,
        },
        errorNotification: false,
      });

      open?.({
        type: "success",
        message: "Success",
        description:
          "Name updated successfully. Changes may take a moment to reflect.",
      });
    } catch {
      open?.({
        type: "error",
        message: "Failed to update name.",
      });
    } finally {
      setIsNameUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    setIsPasswordTicketSending(true);
    try {
      const response = await fetch(
        `https://${AUTH0_DOMAIN}/dbconnections/change_password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client_id: AUTH0_CLIENT_ID,
            email: user?.email,
            connection: "Username-Password-Authentication",
          }),
        },
      );
      if (!response.ok) {
        throw new Error("Failed to send password change email.");
      }
      open?.({
        type: "success",
        message: "Success",
        description: "Password change email sent. Please check your inbox.",
      });
    } catch {
      open?.({
        type: "error",
        message: "Error",
        description: "Failed to send password change email.",
      });
    } finally {
      setIsPasswordTicketSending(false);
    }
  };

  const handleDeleteAccount = () => {
    Modal.confirm({
      title: "Are you sure you want to delete your account?",
      content: "This action cannot be undone and all your data will be lost.",
      okText: "Yes, Delete My Account",
      okType: "danger",
      cancelText: "No, Keep My Account",
      onOk: async () => {
        setIsDeletingAccount(true);
        try {
          await mutateAsync({
            url: `${API_URL}/users/me`,
            method: "delete",
            values: {},
          });
          open?.({
            type: "success",
            message: "Success",
            description: "Account deleted successfully.",
          });
          await logout({ logoutParams: { returnTo: window.location.origin } });
        } catch {
          open?.({
            type: "error",
            message: "Error",
            description: "Failed to delete account.",
          });
        } finally {
          setIsDeletingAccount(false);
        }
      },
    });
  };

  if (isLoading && !user) {
    return (
      <Spin
        size='large'
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      />
    );
  }

  // Update form initial values when user data is available or changes
  React.useEffect(() => {
    if (user?.name) {
      form.setFieldsValue({ name: user.name });
    }
  }, [user, form]);

  return (
    <Card>
      <Title level={2}>User Profile</Title>
      {user && (
        <div>
          <Title level={4}>Personal Information</Title>
          <p>
            <Text strong>Name:</Text> {user.name}
          </p>
          <p>
            <Text strong>Email:</Text> {user.email}
          </p>
        </div>
      )}
      <Divider />
      <Title level={4}>Change Name</Title>
      <Form form={form} layout='vertical' onFinish={handleChangeName}>
        <Form.Item
          label='New Name'
          name='name'
          data-testid='userName'
          required
          help={
            allowChangeName
              ? "Please enter your new name."
              : "You cannot change your name as it was provided by Google."
          }
          rules={[{ required: true, message: "Please input your new name!" }]}
        >
          <Input disabled={isNameUpdating || !allowChangeName} />
        </Form.Item>
        <Form.Item>
          <Button
            type='primary'
            htmlType='submit'
            loading={isNameUpdating}
            disabled={!allowChangeName}
          >
            Save Name
          </Button>
        </Form.Item>
      </Form>
      <Divider />
      <Title level={4}>Change Password</Title>
      <Space direction='vertical'>
        <Text>
          For security reasons, password changes are handled by sending a secure
          link to your email.
        </Text>
        <Button
          onClick={handleChangePassword}
          loading={isPasswordTicketSending}
        >
          Send Password Change Email
        </Button>
      </Space>
      <Divider />
      <Title level={4}>Delete Account</Title>
      <Space direction='vertical'>
        <Text>
          Be careful, this action is irreversible and will permanently delete
          your account and all associated data.
        </Text>
        <Button
          danger
          onClick={handleDeleteAccount}
          loading={isDeletingAccount}
        >
          Delete My Account
        </Button>
      </Space>
    </Card>
  );
};
