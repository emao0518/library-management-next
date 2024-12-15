import { userAdd, userUpdate } from "@/api";
import { Content } from "@/components";
import { USER_ROLE, USER_SEX, USER_STATUS } from "@/constants";
import { UserFormProps, UserType } from "@/types";
import { useCurrentUser } from "@/utils/hoos";
import { Button, Form, Input, Radio, message } from "antd";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import styles from "./index.module.css";

const UserForm: React.FC<UserFormProps> = ({
  title,
  editData = {
    sex: USER_SEX.MALE,
    status: USER_STATUS.ON,
    role: USER_ROLE.USER,
    _id: null,
  },
}) => {
  const [form] = Form.useForm();
  const router = useRouter();

  const user = useCurrentUser();
  useEffect(() => {
    form.setFieldsValue(editData);
  }, [editData, form]);

  const handleFinish = async (values: UserType) => {
    try {
      if (editData?._id) {
        await userUpdate(editData._id, values);
        message.success("Eidted successfully!");
      } else {
        await userAdd(values);
        message.success("Created successfully!");
      }
      setTimeout(() => {
        router.push("/user");
      });
    } catch (error) {
      console.error(error);
    }
  };

  const isEdit = !!editData?._id;

  return (
    <>
      <Content title={title}>
        <Form
          name="book"
          form={form}
          labelCol={{ span: 3 }}
          wrapperCol={{ span: 18 }}
          className={styles.form}
          initialValues={editData}
          onFinish={handleFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Username"
            name="name"
            rules={[
              {
                required: true,
                message: "Please enter username",
              },
            ]}
          >
            <Input placeholder="Please enter" />
          </Form.Item>
          <Form.Item label="Gender" name="sex">
            <Radio.Group>
              <Radio value="male">Male</Radio>
              <Radio value="female">Female</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[
              {
                required: isEdit ? false : true,
                message: "Please enter password",
              },
            ]}
          >
            <Input.Password placeholder="Please enter" type="password" />
          </Form.Item>
          <Form.Item label="Status" name="status">
            <Radio.Group disabled={user?.role === USER_ROLE.USER}>
              <Radio value="on">Active</Radio>
              <Radio value="off">Deactive</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="Role" name="role">
            <Radio.Group disabled={user?.role === USER_ROLE.USER}>
              <Radio value="user">User</Radio>
              <Radio value="admin">Admin</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label=" " colon={false}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className={styles.btn}
            >
              {editData?._id ? "Update" : "Create"}
            </Button>
          </Form.Item>
        </Form>
      </Content>
    </>
  );
};

export default UserForm;
