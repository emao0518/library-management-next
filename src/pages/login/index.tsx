import { UserLoginType } from "@/types";
import request from "@/utils/request";
import Icon from "@ant-design/icons";
import { Button, Form, Input, message } from "antd";
import classnames from "classnames";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";

import styles from "./index.module.css";

export default function Login() {
  const router = useRouter();
  const onFinish = async (values: UserLoginType) => {
    try {
      const res = await request.post("/api/login", values);
      localStorage.setItem("user", JSON.stringify(res.data));
      message.success("Login successfully!");

      router.push("/book");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Head>
        <title>Log In</title>
        <meta name="description" content="Library Mangement System" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <header className={styles.header}>
          <Image
            className={styles.img}
            width={100}
            height={100}
            src="/logo.svg"
            alt="logo"
          />
          Library Management System
        </header>
        <div className={styles.form}>
          <Form
            name="basic"
            initialValues={{ name: "", password: "" }}
            onFinish={onFinish}
            layout="vertical"
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="name"
              label={<span className={styles.label}>Username</span>}
              rules={[{ required: true, message: "Please enter username" }]}
            >
              <Input placeholder="Please enter username" />
            </Form.Item>
            <Form.Item
              name="password"
              label={<span className={styles.label}>Password</span>}
              rules={[{ required: true, message: "Please enter password" }]}
            >
              <Input.Password placeholder="Please enter password" />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                className={classnames(styles.btn, styles.loginBtn)}
                size="large"
              >
                Log In
              </Button>
            </Form.Item>
          </Form>
        </div>
      </main>
    </>
  );
}
