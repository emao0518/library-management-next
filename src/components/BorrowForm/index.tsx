import { borrowAdd, borrowUpdate, getBookList, getUserList } from "@/api";
import { BookType, BorrowOptionType, BorrowType, UserType } from "@/types";
import { Button, Form, Select, message } from "antd";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import Content from "../Content";
import styles from "./index.module.css";

const BorrowForm: React.FC<any> = ({ title, editData }) => {
  const [form] = Form.useForm();
  const router = useRouter();
  const [userList, setUserList] = useState([]);
  const [bookList, setBookList] = useState([]);
  const [bookStock, setBookStock] = useState(0);

  useEffect(() => {
    getUserList().then((res) => {
      setUserList(res.data);
    });
    getBookList({ all: true }).then((res) => {
      setBookList(res.data);
    });
  }, []);

  useEffect(() => {
    form.setFieldsValue(editData);
  }, [editData, form]);

  const handleFinish = async (values: BorrowType) => {
    try {
      if (editData?._id) {
        await borrowUpdate(editData._id, values);
        message.success("Edited successfully!");
      } else {
        await borrowAdd(values);
        message.success("Created successfully!");
      }
      router.push("/borrow");
    } catch (error) {
      console.error(error);
    }
  };

  const handleBookChange = (
    value: string,
    option: BorrowOptionType | BorrowOptionType[]
  ) => {
    setBookStock((option as BorrowOptionType).stock);
  };

  return (
    <Content title={title}>
      <Form
        className={styles.form}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        form={form}
        onFinish={handleFinish}
        autoComplete="off"
      >
        <Form.Item
          label="Book Name"
          name="book"
          rules={[
            {
              required: true,
              message: "Please select a book",
            },
          ]}
        >
          <Select
            placeholder="Please select"
            showSearch
            optionFilterProp="label"
            onChange={handleBookChange}
            options={bookList.map((item: BookType) => ({
              label: item.name,
              value: item._id as string,
              stock: item.stock,
            }))}
          />
        </Form.Item>
        <Form.Item
          label="Issue the book to"
          name="user"
          rules={[
            {
              required: true,
              message: "Please select a user",
            },
          ]}
        >
          <Select
            placeholder="Please select"
            showSearch
            optionFilterProp="label"
            options={userList.map((item: UserType) => ({
              label: item.name,
              value: item._id,
            }))}
          />
        </Form.Item>
        <Form.Item
          label="Book stock"
          rules={[
            {
              required: true,
              message: "Please enter",
            },
          ]}
        >
          {bookStock}
        </Form.Item>
        <Form.Item label=" " colon={false}>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            className={styles.btn}
            disabled={bookStock <= 0 && !editData?._id}
          >
            {editData?._id ? "Eidt" : "Create"}
          </Button>
        </Form.Item>
      </Form>
    </Content>
  );
};

export default BorrowForm;
