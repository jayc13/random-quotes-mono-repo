import { useAuth0 } from "@auth0/auth0-react";
import { useNotification } from "@refinedev/core";
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

const { Title, Text } = Typography;

export const ProfilePage: React.FC = () => {
  const { user, isLoading, getAccessTokenSilently, logout } = useAuth0();
  const { open } = useNotification();
  const [form] = Form.useForm();

  const [isNameUpdating, setIsNameUpdating] = useState(false);
  const [isPasswordTicketSending, setIsPasswordTicketSending] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleChangeName = async (values: { name: string }) => {
    if (!user?.sub) {
      open?.({
        type: "error",
        message: "Error",
        description: "User ID not found.",
      });
      return;
    }
    setIsNameUpdating(true);
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch("/server/users/name", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: values.name }),
      });
      if (!response.ok) throw new Error("Failed to update name");
      open?.({
        type: "success",
        message: "Success",
        description:
          "Name updated successfully. Changes may take a moment to reflect.",
      });
      // NOTE: The user object from useAuth0() will not reflect this change immediately.
      // A page refresh or re-login might be needed to see the updated name from Auth0.
      // Or, if the server response includes the updated user, update the local state.
    } catch {
      open?.({
        type: "error",
        message: "Error",
        description: "Failed to update name.",
      });
    } finally {
      setIsNameUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user?.sub) {
      open?.({
        type: "error",
        message: "Error",
        description: "User ID not found.",
      });
      return;
    }
    setIsPasswordTicketSending(true);
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch("/server/users/forgot-password", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}), // Empty body or specific payload if required by backend
      });
      if (!response.ok) throw new Error("Failed to send password change email");
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
    if (!user?.sub) {
      open?.({
        type: "error",
        message: "Error",
        description: "User ID not found.",
      });
      return;
    }
    Modal.confirm({
      title: "Are you sure you want to delete your account?",
      content: "This action cannot be undone and all your data will be lost.",
      okText: "Yes, Delete My Account",
      okType: "danger",
      cancelText: "No, Keep My Account",
      onOk: async () => {
        setIsDeletingAccount(true);
        try {
          const token = await getAccessTokenSilently();
          const response = await fetch("/server/users/me", {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!response.ok) throw new Error("Failed to delete account");
          open?.({
            type: "success",
            message: "Success",
            description: "Account deleted successfully.",
          });
          logout({ logoutParams: { returnTo: window.location.origin } });
        } catch (error) {
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
    // Keep showing spinner if user is not yet loaded
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
      <Form
        form={form}
        layout='vertical'
        onFinish={handleChangeName}
        // initialValues is set by useEffect now
      >
        <Form.Item
          label='New Name'
          name='name'
          rules={[{ required: true, message: "Please input your new name!" }]}
        >
          <Input disabled={isNameUpdating} />
        </Form.Item>
        <Form.Item>
          <Button type='primary' htmlType='submit' loading={isNameUpdating}>
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
