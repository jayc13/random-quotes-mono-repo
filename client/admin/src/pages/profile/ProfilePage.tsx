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
  message,
} from "antd";
import React, { useState } from "react";
import {
  changeUserPassword,
  deleteUserAccount,
  updateUserName,
} from "../../utils/auth0";

const { Title, Text } = Typography;
const VITE_AUTH0_DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN as string;

export const ProfilePage: React.FC = () => {
  const { user, isLoading, getAccessTokenSilently, logout } = useAuth0();
  const { open } = useNotification();
  const [form] = Form.useForm();

  const [isNameUpdating, setIsNameUpdating] = useState(false);
  const [isPasswordTicketSending, setIsPasswordTicketSending] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const auth0ApiOptions = {
    getAccessTokenSilently,
    auth0Domain: VITE_AUTH0_DOMAIN,
    userId: user?.sub || "",
  };

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
      await updateUserName(auth0ApiOptions, values.name);
      open?.({
        type: "success",
        message: "Success",
        description:
          "Name updated successfully. Changes may take a moment to reflect.",
      });
      // Optionally, you might want to refresh the user object or parts of it.
      // For example, by calling getAccessTokenSilently again to get an updated token/user profile
      // or by re-fetching user data if you have a separate mechanism.
      // Auth0's `user` object might not update immediately without a new login or token refresh.
    } catch (error: any) {
      open?.({
        type: "error",
        message: "Error",
        description: error.message || "Failed to update name.",
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
      const result = await changeUserPassword(auth0ApiOptions);
      open?.({
        type: "success",
        message: "Success",
        description:
          "Password change email sent. Please check your inbox. Ticket URL: " +
          result.ticket_url,
      });
    } catch (error: any) {
      open?.({
        type: "error",
        message: "Error",
        description: error.message || "Failed to send password change email.",
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
          await deleteUserAccount(auth0ApiOptions);
          open?.({
            type: "success",
            message: "Success",
            description: "Account deleted successfully.",
          });
          logout({ logoutParams: { returnTo: window.location.origin } });
        } catch (error: any) {
          open?.({
            type: "error",
            message: "Error",
            description: error.message || "Failed to delete account.",
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
